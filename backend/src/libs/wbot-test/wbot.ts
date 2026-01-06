import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  CacheStore,
  WABrowserDescription
} from "baileys";
import makeWALegacySocket from "baileys";
import P from "pino";

import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import MAIN_LOGGER from "baileys/lib/Utils/logger";
import authState from "../../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../../errors/AppError";
import { getIO } from "../socket";
import { Store } from "../store";
import { StartWhatsAppSession } from "../../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../../services/BaileysServices/DeleteBaileysService";
import NodeCache from 'node-cache';

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

// type Session = WASocket & {
//   id?: number;
//   store?: Store;
//   _keepAliveInterval?: NodeJS.Timeout;
//   _activityMonitor?: NodeJS.Timeout;
//   _androidConfig?: boolean;
// };

interface Session extends WASocket {
  id?: number;
  store?: Store;
  _keepAliveInterval?: NodeJS.Timeout;
  _activityMonitor?: NodeJS.Timeout;
  _androidConfig?: boolean;
}

const sessions: Session[] = [];
const retriesQrCodeMap = new Map<number, number>();
const androidReconnectionAttempts = new Map<number, number>();
const sessionActivity = new Map<number, number>();

// Funções de gerenciamento de sessão
export const updateSessionActivity = (whatsappId: number): void => {
  sessionActivity.set(whatsappId, Date.now());
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  // Atualizar timestamp de atividade
  updateSessionActivity(whatsappId);
  
   return sessions[sessionIndex] as Session;
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      
      // Limpar intervalos do Android se existirem
      if (session._keepAliveInterval) {
        clearInterval(session._keepAliveInterval);
        delete session._keepAliveInterval;
      }
      
      if (session._activityMonitor) {
        clearInterval(session._activityMonitor);
        delete session._activityMonitor;
      }
      
      if (isLogout) {
        session.logout?.();
        session.ws?.close();
        // Remover listeners de eventos específicos em vez de todos
        if (session.ev) {
          session.ev.removeAllListeners("connection.update");
          session.ev.removeAllListeners("creds.update");
          session.ev.removeAllListeners("messages.upsert");
          session.ev.removeAllListeners("messages.update");
          session.ev.removeAllListeners("contacts.update");
        }
      }

      sessions.splice(sessionIndex, 1);
      sessionActivity.delete(whatsappId);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const cleanupStaleSessions = async (): Promise<void> => {
  const now = Date.now();
  const STALE_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos
  
  for (const session of sessions) {
    if (session.id) {
      const lastActivity = sessionActivity.get(session.id);
      
      // Se a sessão não teve atividade nos últimos 5 minutos
      if (lastActivity && (now - lastActivity > STALE_TIMEOUT)) {
        logger.warn(`Cleaning up stale session for WhatsApp ID: ${session.id}`);
        
        try {
          // Buscar o whatsapp no banco
          const whatsapp = await Whatsapp.findOne({
            where: { id: session.id }
          });
          
          if (whatsapp) {
            // Atualizar status no banco
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: ""
            });
            
            const io = getIO();
            io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
              `company-${whatsapp.companyId}-whatsappSession`,
              {
                action: "update",
                session: whatsapp
              }
            );
          }
          
          // Remover a sessão
          await removeWbot(session.id, true);
          
        } catch (error) {
          logger.error(`Error cleaning up stale session ${session.id}:`, error);
        }
      }
    }
  }
  
  // Também limpar entradas antigas no mapa de atividade
  for (const [whatsappId, timestamp] of sessionActivity.entries()) {
    if (now - timestamp > STALE_TIMEOUT) {
      sessionActivity.delete(whatsappId);
    }
  }
};

// Detectar se é uma conexão Android (pelo nome ou tentativas anteriores)
const detectAndroidConnection = (whatsapp: Whatsapp): boolean => {
  if (!whatsapp.name) return false;
  
  const isAndroidName = whatsapp.name.toLowerCase().includes('android') || 
                       whatsapp.name.toLowerCase().includes('samsung') ||
                       whatsapp.name.toLowerCase().includes('motorola') ||
                       whatsapp.name.toLowerCase().includes('xiaomi') ||
                       whatsapp.name.toLowerCase().includes('redmi') ||
                       whatsapp.name.toLowerCase().includes('oppo') ||
                       whatsapp.name.toLowerCase().includes('vivo');
  
  const hasAndroidAttempt = androidReconnectionAttempts.has(whatsapp.id);
  
  return isAndroidName || hasAndroidAttempt || process.env.FORCE_ANDROID_FIX === 'true';
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) {
          reject(new Error("WhatsApp not found"));
          return;
        }

        // RESET COMPLETO antes de iniciar
        androidReconnectionAttempts.delete(whatsapp.id);
        retriesQrCodeMap.delete(whatsapp.id);
        sessionActivity.delete(whatsapp.id);
        
        // Aguarda 5 segundos entre tentativas
        await new Promise(resolve => setTimeout(resolve, 5000));
        // === FIM DA ADIÇÃO ===

        // Verificar se já existe uma sessão ativa para este WhatsApp
        const existingSessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (existingSessionIndex !== -1) {
          logger.info(`Removing existing session for ${whatsapp.name} before creating new one`);
          await removeWbot(whatsapp.id, true);
          // Pequena pausa para garantir limpeza
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Limpar retries anteriores
        retriesQrCodeMap.delete(whatsapp.id);

        const { id, name, provider } = whatsappUpdate;
        const isAndroid = detectAndroidConnection(whatsappUpdate);

        const { version, isLatest } = await fetchLatestBaileysVersion();
        const isLegacy = provider === "stable";

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`Starting session ${name} ${isAndroid ? '(Android mode)' : ''}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;

        const { state, saveState } = await authState(whatsapp);

        const msgRetryCounterCache = new NodeCache();

        let connectionTimeout: NodeJS.Timeout;

        // Configuração base comum
        const baseConfig = {
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
          },
          version,
          fireInitQueries: false,
          msgRetryCounterCache,
          shouldIgnoreJid: jid => isJidBroadcast(jid),
          generateHighQualityLinkPreview: false,
          linkPreviewImageThumbnailWidth: 192,
        };

        if (isAndroid) {
          console.log("WhatsAPp")
          // CONFIGURAÇÕES CRÍTICAS PARA ANDROID:
          wsocket = makeWASocket({
            ...baseConfig,
            browser: ["Chrome", "120.0.0.0", "Windows"] as WABrowserDescription,
            syncFullHistory: false,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 20000,
            markOnlineOnConnect: false,
            emitOwnEvents: false,
            options: {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://web.whatsapp.com',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            }
          });
        } else {
          // Configuração normal
          wsocket = makeWASocket({
            ...baseConfig,
            browser: Browsers.appropriate("Desktop"),
            syncFullHistory: true,
            markOnlineOnConnect: true,
            connectTimeoutMs: 30000,
          });
        }

        // Marcar como configuração Android se necessário
        if (isAndroid) {
          wsocket._androidConfig = true;
        }

        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
            }

            if (connection === "connecting") {
              connectionTimeout = setTimeout(async () => {
                logger.warn(`Connection timeout for ${name}. Restarting...`);
                wsocket.ws?.close();
              }, 60000);
            }

            logger.info(
              `Socket ${name} Connection Update ${connection || ""}`
            );

            if (connection === "close") {
              const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
              const errorMessage = (lastDisconnect?.error as Boom)?.message;
              
              logger.warn(`Session ${name} disconnected with code: ${statusCode}, message: ${errorMessage}`);
              
              // Casos especiais que não devem reconectar
              if (statusCode === 401 || statusCode === 403) {
                // Dispositivo removido ou sessão inválida
                logger.warn(`Session ${name} was removed from WhatsApp (${statusCode}).`);
                
                // Verificar se já tentamos reconectar como Android
                const androidAttempts = androidReconnectionAttempts.get(id) || 0;
                
                if (androidAttempts === 0) {
                  // Primeira vez: marcar como Android e tentar reconectar
                  logger.warn(`First time 401 for ${name}. Will try Android configuration in 2 minutes.`);
                  androidReconnectionAttempts.set(id, 1);
                  
                  await whatsapp.update({ 
                    status: "DISCONNECTED", 
                    session: "",      
                    qrcode: "",
                    retries: 0
                  });
                  
                  await DeleteBaileysService(whatsapp.id);
                  
                  io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                  });
                  
                  removeWbot(id, false);
                  
                  // Agendar reconexão com configuração Android após 2 minutos
                  setTimeout(
                    () => {
                      logger.info(`Trying to reconnect ${name} with Android configuration.`);
                      // Forçar configuração Android na próxima tentativa
                      process.env.FORCE_ANDROID_FIX = 'true';
                      StartWhatsAppSession(whatsapp, whatsapp.companyId);
                    },
                    120000
                  );
                } else {
                  // Já tentamos e falhou, parar
                  logger.warn(`Already tried Android reconnection for ${name}. Stopping.`);
                  androidReconnectionAttempts.delete(id);
                  
                  await whatsapp.update({ 
                    status: "DISCONNECTED", 
                    session: "",      
                    qrcode: "",
                    retries: 0
                  });
                  
                  await DeleteBaileysService(whatsapp.id);
                  
                  io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                  });
                  
                  removeWbot(id, false);
                }
                return;
              }
              
              // Erro 515: Too many reconnections
              if (statusCode === 515) {
                logger.error(`Too many reconnections for ${name}. Stopping for 5 minutes.`);
                
                await whatsapp.update({
                  status: "DISCONNECTED",
                  session: "",
                  qrcode: "",
                  retries: 0
                });
                
                await DeleteBaileysService(whatsapp.id);
                
                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                
                removeWbot(id, false);

                // === ADICIONE ESTAS LINHAS (reset dos contadores) ===
                androidReconnectionAttempts.delete(id);
                retriesQrCodeMap.delete(id);
                sessionActivity.delete(id);
              // === FIM DA ADIÇÃO ===
                
                // Tentar reconexão após 5 minutos
                setTimeout(
                  () => {
                    logger.info(`Retrying connection for ${name} after 5 minutes.`);
                    StartWhatsAppSession(whatsapp, whatsapp.companyId);
                  },
                  300000
                );
                return;
              }
              
              if (statusCode !== DisconnectReason.loggedOut) {
                // Para outros erros, tenta reconectar com backoff exponencial
                const attemptCount = androidReconnectionAttempts.get(id) || 1;
                const delay = Math.min(1000 * Math.pow(2, attemptCount), 30000);
                
                logger.info(`Will attempt reconnect for ${name} in ${delay}ms`);
                
                setTimeout(
                  () => {
                    removeWbot(id, false);
                    StartWhatsAppSession(whatsapp, whatsapp.companyId);
                  },
                  delay
                );
              } else {
                // Logout manual
                await whatsapp.update({ 
                  status: "PENDING", 
                  session: "",
                  qrcode: "",
                  retries: 0
                });
                
                await DeleteBaileysService(whatsapp.id);
                
                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                
                removeWbot(id, false);
                androidReconnectionAttempts.delete(id);
              }
            }

            if (connection === "open") {
            
              console.log("🎯🎯🎯 USUÁRIO ESCANEOU QR CODE AQUI!");
              console.log("Conexão estabelecida com WhatsApp");
              
              if (androidReconnectionAttempts.has(id)) {
                androidReconnectionAttempts.delete(id);
              }
              
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                lastConnection: new Date()
              });

              updateSessionActivity(whatsapp.id);

              io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );

              if (sessionIndex === -1) {
                // wsocket.id = whatsapp.id;
                (wsocket as any).id = whatsapp.id
                sessions.push(wsocket as Session);
              }

              // Se for Android, aplicar comportamento pós-conexão
              if (isAndroid) {
                logger.info(`Android session ${name} connected, starting post-connection routine.`);

                // Esperar 30 segundos antes de qualquer ação
                setTimeout(async () => {
                  try {
                    await wsocket.sendPresenceUpdate('available');
                    await wsocket.fetchBlocklist();

                    // Manter atividade a cada 15 segundos
                    wsocket._keepAliveInterval = setInterval(() => {
                      try {
                        wsocket.sendPresenceUpdate('available');
                      } catch (e) {
                        // Ignora erros de keep-alive
                      }
                    }, 15000);

                    // Monitor de atividade - Android precisa de atividade constante
                    wsocket._activityMonitor = setInterval(async () => {
                      try {
                        // Simula atividade do usuário
                        await wsocket.readMessages([{
                          id: 'status',
                          remoteJid: 'status@broadcast'
                        }]);
                      } catch (e) {
                        // Ignora
                      }
                    }, 45000);

                  } catch (error) {
                    logger.warn(`Android post-connection setup failed: ${error.message}`);
                  }
                }, 30000);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              const currentRetries = retriesQrCodeMap.get(id) || 0;
  
              if (currentRetries >= 5) {
                logger.warn(`Max QR code retries (5) reached for ${name}. Stopping.`);
                
                await whatsappUpdate.update({
                  status: "DISCONNECTED",
                  qrcode: "",
                  retries: 0
                });
                
                await DeleteBaileysService(whatsappUpdate.id);
                
                io.to(`company-${whatsapp.companyId}-mainchannel`).emit("whatsappSession", {
                  action: "update",
                  session: whatsappUpdate
                });
                
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws?.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
                
                return; 
              } else {
                logger.info(`Session QRCode Generate ${name} (attempt ${currentRetries + 1}/5)`);
                retriesQrCodeMap.set(id, currentRetries + 1);

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  // wsocket.id = whatsapp.id;
                  (wsocket as any).id = whatsapp.id;
                  sessions.push(wsocket as Session);
                }

                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveState);

      })();
    } catch (error) {
      Sentry.captureException(error);
      logger.error(`Error in initWASocket: ${error}`);
      reject(error);
    }
  });
};

export const initSessionCleanup = (): void => {
  // Limpar a cada minuto
  setInterval(cleanupStaleSessions, 60 * 1000);
  
  logger.info("Session cleanup scheduler initialized");
};

// Função especial para preparar conexão Android
export const prepareAndroidConnection = async (whatsapp: Whatsapp): Promise<void> => {
  logger.info(`Preparing Android connection for ${whatsapp.name}`);
  
  // Marcar como Android
  process.env.FORCE_ANDROID_FIX = 'true';
  
  // Limpar sessão anterior completamente
  await DeleteBaileysService(whatsapp.id);
  
  // Aguardar
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Atualizar status
  await whatsapp.update({
    status: "DISCONNECTED",
    session: "",
    qrcode: "",
    retries: 0
  });
  
  logger.info(`Android connection prepared for ${whatsapp.name}`);
};

// Adicionar esta função para forçar reconexão Android
export const restartSessionAsAndroid = async (whatsappId: number): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({ where: { id: whatsappId } });
  if (!whatsapp) {
    throw new Error("WhatsApp not found");
  }
  
  await prepareAndroidConnection(whatsapp);
  StartWhatsAppSession(whatsapp, whatsapp.companyId);
};

export const resetAllConnectionAttempts = async (): Promise<void> => {
  logger.info("=== RESETTING ALL CONNECTION ATTEMPTS ===");
  
  // Limpar todos os maps
  androidReconnectionAttempts.clear();
  retriesQrCodeMap.clear();
  sessionActivity.clear();
  
  // Parar todas as sessões
  for (const session of sessions) {
    if (session.id) {
      await removeWbot(session.id, true);
    }
  }
  sessions.length = 0;
  
  // Limpar todas as sessões no banco
  try {
    await Whatsapp.update(
      { 
        status: "DISCONNECTED", 
        session: "",
        qrcode: "",
        retries: 0
      },
      { 
        where: { 
          status: ["CONNECTED", "OPENING", "qrcode"] 
        } 
      }
    );
    logger.info("All WhatsApp sessions reset in database");
  } catch (error) {
    logger.error("Error resetting database:", error);
  }
  
  // Limpar cache do baileys para todos
  try {
    const allWhatsapps = await Whatsapp.findAll();
    for (const wapp of allWhatsapps) {
      await DeleteBaileysService(wapp.id);
    }
    logger.info("All Baileys caches cleared");
  } catch (error) {
    logger.error("Error clearing caches:", error);
  }
                                                                        
  logger.info("=== ALL CONNECTION ATTEMPTS RESET SUCCESSFULLY ===");
      
  // Aguarde 30 segundos antes de tentar conectar novamente
  await new Promise(resolve => setTimeout(resolve, 30000));
};
