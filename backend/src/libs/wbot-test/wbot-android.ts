import makeWASocket, {
  WASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  WABrowserDescription,
  AuthenticationCreds
} from "baileys";
import { Boom } from "@hapi/boom";
import NodeCache from 'node-cache';
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import MAIN_LOGGER from "baileys/lib/Utils/logger";
import authState from "../../helpers/authState";
import DeleteBaileysService from "../../services/BaileysServices/DeleteBaileysService";
import { getIO } from "../socket";
import AppError from "../../errors/AppError";

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

// Interface extendida para incluir id
interface AndroidSession extends WASocket {
  id?: number;
}

const androidSessions: AndroidSession[] = [];

// Função para resetar credenciais de forma segura
const resetCredentialsForAndroid = (creds: AuthenticationCreds): AuthenticationCreds => {
  return {
    ...creds,
    registered: false,
    // Mantém outras propriedades essenciais
    noiseKey: creds.noiseKey,
    pairingEphemeralKeyPair: creds.pairingEphemeralKeyPair,
    signedIdentityKey: creds.signedIdentityKey,
    signedPreKey: creds.signedPreKey,
    registrationId: creds.registrationId,
    advSecretKey: creds.advSecretKey,
    processedHistoryMessages: creds.processedHistoryMessages,
    nextPreKeyId: creds.nextPreKeyId,
    firstUnuploadedPreKeyId: creds.firstUnuploadedPreKeyId,
    accountSyncCounter: creds.accountSyncCounter,
    accountSettings: creds.accountSettings,
    // Reseta informações de login
    me: undefined,
    myAppStateKeyId: undefined
  };
};

export const getAndroidWbot = (whatsappId: number): AndroidSession => {
  const session = androidSessions.find(s => s.id === whatsappId);
  if (!session) {
    throw new AppError("ERR_WAPP_ANDROID_NOT_INITIALIZED");
  }
  return session;
};

export const removeAndroidWbot = async (whatsappId: number): Promise<void> => {
  try {
    const sessionIndex = androidSessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      const session = androidSessions[sessionIndex];
      session.logout?.();
      session.ws?.close();
      session.ev?.removeAllListeners("connection.update");
      session.ev?.removeAllListeners("creds.update");
      androidSessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWASocketForAndroid = async (whatsapp: Whatsapp): Promise<AndroidSession> => {
  return new Promise(async (resolve, reject) => {
    try {
      // CRÍTICO: Espera 60 segundos para evitar bloqueio
      logger.info(`Aguardando 60 segundos antes de conectar Android ${whatsapp.name}...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      const io = getIO();
      
      // 1. LIMPEZA NUCLEAR
      logger.info(`Limpando sessão anterior do Android ${whatsapp.name}...`);
      await DeleteBaileysService(whatsapp.id);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 2. CRIA NOVAS CREDENCIAIS (simula primeiro acesso)
      const { state, saveState } = await authState(whatsapp);
      
      // Força credenciais frescas para Android
      state.creds = resetCredentialsForAndroid(state.creds);
      
      const { version } = await fetchLatestBaileysVersion();
      const msgRetryCounterCache = new NodeCache();
      
      logger.info(`Iniciando conexão Android otimizada para ${whatsapp.name}`);
      
      // 3. CONFIGURAÇÃO ESPECÍFICA ANDROID - SIMPLIFICADA
      // REMOVA as opções complexas do WebSocket que causam erro
      const wsocket = makeWASocket({
        // VERSÃO ESTÁVEL
        version: [2, 3000, 101010101],
        
        // USER-AGENT EXATO DO WHATSAPP WEB
        browser: Browsers.ubuntu("Chrome"), // Opção mais segura
        
        printQRInTerminal: true,
        
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        
        logger: loggerBaileys,
        connectTimeoutMs: 30000,
        keepAliveIntervalMs: 15000,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 60000,
        syncFullHistory: false,
        fireInitQueries: false, // IMPORTANTE: false para Android
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 192,
        msgRetryCounterCache,
        shouldIgnoreJid: jid => isJidBroadcast(jid),
        retryRequestDelayMs: 1000,
        maxMsgRetryCount: 3,
        
        // REMOVA completamente a propriedade 'options' que causa erro
        // Não use options/headers - deixe o Baileys lidar com isso
        
      }) as AndroidSession; // Type casting para incluir propriedade id
      
      // Agora podemos adicionar a propriedade id
      (wsocket as any).id = whatsapp.id;
      
      wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        logger.info(`[ANDROID] ${whatsapp.name}: ${connection}`);
        
        if (connection === "open") {
          await whatsapp.update({
            status: "CONNECTED",
            qrcode: "",
            retries: 0,
            platform: "android"
          });
          
          // Atribui o id diretamente ao objeto
          (wsocket as any).id = whatsapp.id;
          
          const existingIndex = androidSessions.findIndex(s => s.id === whatsapp.id);
          if (existingIndex === -1) {
            androidSessions.push(wsocket);
          }
          
          io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
            action: "update",
            session: whatsapp
          });
          
          resolve(wsocket);
        }
        
        if (connection === "close") {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          
          // ANDROID: Se der 401/403/515, para completamente
          if (statusCode === 401 || statusCode === 403 || statusCode === 515) {
            logger.error(`[ANDROID] Sessão bloqueada (${statusCode}) para ${whatsapp.name}.`);
            
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
            
            removeAndroidWbot(whatsapp.id);
            return;
          }
          
          // Outros erros: reconecta em 2 minutos
          if (statusCode !== DisconnectReason.loggedOut) {
            setTimeout(async () => {
              removeAndroidWbot(whatsapp.id);
              initWASocketForAndroid(whatsapp);
            }, 120000);
          }
        }
        
        if (qr) {
          await whatsapp.update({
            qrcode: qr,
            status: "qrcode",
            retries: 0
          });
          
          // Atribui o id
          (wsocket as any).id = whatsapp.id;
          
          const existingIndex = androidSessions.findIndex(s => s.id === whatsapp.id);
          if (existingIndex === -1) {
            androidSessions.push(wsocket);
          }
          
          io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }
      });
      
      wsocket.ev.on("creds.update", saveState);
      
      // Timeout de conexão
      setTimeout(() => {
        if (!wsocket.user) {
          logger.warn(`[ANDROID] Timeout para ${whatsapp.name}`);
          wsocket.ws?.close();
          reject(new Error("Android connection timeout"));
        }
      }, 120000);
      
    } catch (error) {
      logger.error(`[ANDROID] Erro: ${error}`);
      reject(error);
    }
  });
};

// Função auxiliar para preparar conexão Android
export const prepareAndroidConnection = async (whatsapp: Whatsapp): Promise<void> => {
  logger.info(`Preparando conexão Android para ${whatsapp.name}`);
  
  // Limpeza completa
  await DeleteBaileysService(whatsapp.id);
  
  // Aguarda
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Atualiza status
  await whatsapp.update({
    status: "DISCONNECTED",
    session: "",
    qrcode: "",
    retries: 0,
    platform: "android"
  });
  
  logger.info(`Conexão Android preparada para ${whatsapp.name}`);
};