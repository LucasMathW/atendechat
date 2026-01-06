import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  // makeInMemoryStore,
  isJidBroadcast,
  CacheStore
} from "baileys";

import { makeInMemoryStore } from "baileys";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "baileys/lib/Utils/logger";
import authState from "../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { Store } from "./store";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import NodeCache from "node-cache";
let hasOpened = false;
let isStable = false;

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

const store = makeInMemoryStore({
  logger: loggerBaileys
});

type Session = WASocket & {
  id?: number;
  store?: Store;
};

export const sessions: Session[] = [];

const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;

        const { version, isLatest } = await fetchLatestBaileysVersion();
        const isLegacy = provider === "stable" ? true : false;

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`isLegacy: ${isLegacy}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;
        let hasOpened = false;

        // const store = makeInMemoryStore({
        //   logger: loggerBaileys
        // });

        const { state, saveState } = await authState(whatsapp);
        // LOG DETALHADO DAS CREDS:
        logger.info(`[AUTH-DEBUG] ==== CREDS STATUS ====`);
        logger.info(`[AUTH-DEBUG] Registered: ${state.creds.registered}`);
        logger.info(`[AUTH-DEBUG] Me: ${JSON.stringify(state.creds.me)}`);
        logger.info(`[AUTH-DEBUG] Platform: ${state.creds.platform}`);
        logger.info(
          `[AUTH-DEBUG] Account: ${
            state.creds.account ? "Presente" : "Ausente"
          }`
        );
        logger.info(`[AUTH-DEBUG] ======================`);

        const msgRetryCounterCache = new NodeCache();
        const userDevicesCache: CacheStore = new NodeCache();

        wsocket = makeWASocket({
          markOnlineOnConnect: true,
          logger: loggerBaileys,
          printQRInTerminal: false,
          browser: Browsers.appropriate("Desktop"),
          // browser: ["Ubuntu", "Chrome", "120.0.0.0"],
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
          },
          version,
          // defaultQueryTimeoutMs: 60000,
          // retryRequestDelayMs: 250,
          // keepAliveIntervalMs: 1000 * 60 * 10 * 3,
          msgRetryCounterCache,
          shouldIgnoreJid: jid => isJidBroadcast(jid)
        });

        // store.bind(wsocket.ev);

        // setInterval(() => {
        //   store.writeToFile(`./store/${whatsapp.id}.json`);
        // }, 10_000);

        // store.readFromFile(`./store/${whatsapp.id}.json`);

        // wsocket.ev.on("messages.upsert", async ({ messages }) => {
        //   for (const msg of messages) {
        //     if (msg.key?.remoteJid?.endsWith("@g.us") && msg.message === null) {
        //       logger.warn("Mensagem de grupo ignorada (SenderKey ausente)");
        //       return;
        //     }
        //   }
        // });

        // Adicione ANTES do wsocket.ev.on("connection.update"):
        wsocket.ev.on("messages.upsert", async ({ messages, type }) => {
          logger.info(
            `[DEBUG] Mensagem recebida - Tipo: ${type}, Quantidade: ${messages.length}`
          );

          for (const msg of messages) {
            logger.info(
              `[DEBUG] Mensagem JID: ${msg.key.remoteJid}, De mim: ${msg.key.fromMe}`
            );

            // Log específico para grupos
            if (msg.key.remoteJid?.endsWith("@g.us")) {
              logger.info(`[DEBUG] Grupo detectado: ${msg.key.remoteJid}`);
              logger.info(`[DEBUG] Participante: ${msg.key.participant}`);
              logger.info(`[DEBUG] Mensagem é nula? ${msg.message === null}`);
            }
          }
        });

        // LOG ESPECÍFICO PARA ERROS DE DECRIPTAÇÃO
        wsocket.ev.on("messages.update", async updates => {
          for (const update of updates) {
            if (update.update?.messageStubType === 7) {
              // Erro de decriptação
              logger.error(
                `[ERROR] Erro de decriptação detectado para: ${update.key.remoteJid}`
              );
            }
          }
        });

        wsocket.ev.on(
          "connection.update",
          async ({
            connection,
            lastDisconnect,
            qr,
            receivedPendingNotifications
          }) => {
            logger.info(
              `Socket  ${name} Connection Update ${connection || ""} ${
                lastDisconnect || ""
              }`
            );

            logger.info(
              `[CONN-DEBUG] Connection: ${connection}, ReceivedPending: ${receivedPendingNotifications}, QR: ${
                qr ? "Sim" : "Não"
              }`
            );

            let checkInterval;

            if (connection === "open") {
              checkInterval = setInterval(async () => {
                logger.info(
                  `[HEALTH-CHECK] Status: CONNECTED, Registered: ${state.creds.registered}`
                );

                // Verifique grupos periodicamente
                try {
                  const profile = await wsocket.profilePictureUrl(
                    wsocket.user.id,
                    "image"
                  );
                  logger.info(
                    `[HEALTH-CHECK] Profile picture: ${profile ? "OK" : "N/A"}`
                  );
                } catch (err) {
                  logger.warn(
                    `[HEALTH-CHECK] Profile check error: ${err.message}`
                  );
                }
              }, 10000); // A cada 10 segundos

              // LOG EXTRA quando abrir
              logger.info(`[CONN-DEBUG] Sessão aberta - Verificando creds...`);
              logger.info(
                `[CONN-DEBUG] Creds registered: ${state.creds.registered}`
              );
              logger.info(`[CONN-DEBUG] Me ID: ${state.creds.me?.id}`);

              if ((wsocket as any).hasOpened) {
                logger.warn("Evento open duplicado ignorado");
                return;
              }

              hasOpened = true;
              (wsocket as any).hasOpened = true;
              (wsocket as any).isAlive = true;

              retriesQrCodeMap.delete(whatsapp.id);

              // ⚠️ NÃO marque CONNECTED ainda
              await whatsapp.update({
                status: "PAIRING",
                qrcode: null
              });

              io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                `company-${whatsapp.companyId}-whatsappSession`,
                {
                  action: "update",
                  session: whatsapp
                }
              );

              // ⚠️ ADICIONE ESTE LOG CRÍTICO:
              setTimeout(async () => {
                try {
                  // Teste grupos IMEDIATAMENTE
                  const groups = await wsocket.groupFetchAllParticipating();
                  logger.info(
                    `[CONN-DEBUG] Grupos sincronizados: ${
                      Object.keys(groups).length
                    }`
                  );

                  // Teste SenderKeys
                  for (const groupId in groups) {
                    const group = groups[groupId];
                    logger.info(
                      `[CONN-DEBUG] Grupo ${group.subject} tem ${group.participants?.length} participantes`
                    );
                  }
                } catch (err) {
                  logger.error(
                    `[CONN-DEBUG] ERRO ao sincronizar grupos: ${err.message}`
                  );
                  logger.error(`[CONN-DEBUG] Stack: ${err.stack}`);
                }
              }, 3000);

              // ⏳ Aguarda estabilização real do WhatsApp
              setTimeout(async () => {
                // se caiu nesse meio tempo, aborta
                if (!hasOpened || !(wsocket as any).isAlive) {
                  logger.warn(
                    "Socket não está mais ativo, abortando CONNECTED"
                  );
                  return;
                }

                try {
                  await wsocket.groupFetchAllParticipating();

                  await whatsapp.update({
                    status: "CONNECTED",
                    qrcode: null,
                    retries: 0
                  });

                  io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                    `company-${whatsapp.companyId}-whatsappSession`,
                    {
                      action: "update",
                      session: whatsapp
                    }
                  );

                  const sessionIndex = sessions.findIndex(
                    s => s.id === whatsapp.id
                  );

                  if (sessionIndex === -1) {
                    wsocket.id = whatsapp.id;
                    sessions.push(wsocket);
                  }

                  resolve(wsocket);

                  logger.info("Sessão WhatsApp estabilizada com sucesso");
                } catch (err) {
                  logger.warn(
                    "Falha na estabilização, aguardando reconexão:",
                    err
                  );
                }
              }, 8_000); // 🔑 TEMPO CRÍTICO (6–10s)
            }

            if (hasOpened) {
              return;
            }

            if (connection === "connecting" && !hasOpened) {
              await whatsapp.update({
                status: "PAIRING",
                qrcode: null
              });

              io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                `company-${whatsapp.companyId}-whatsappSession`,
                {
                  action: "update",
                  session: whatsapp
                }
              );

              return;
            }

            if (connection === "close") {
              if (checkInterval) clearInterval(checkInterval);
              hasOpened = false;
              (wsocket as any).isAlive = false;

              const statusCode = (lastDisconnect?.error as Boom)?.output
                ?.statusCode;

              // 🔥 Logout real
              if (
                statusCode === DisconnectReason.loggedOut ||
                statusCode === 403
              ) {
                logger.warn("Logout real detectado, limpando sessão");

                hasOpened = false;
                isStable = false;

                await whatsapp.update({ status: "PENDING", session: "" });
                await DeleteBaileysService(whatsapp.id);

                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                  `company-${whatsapp.companyId}-whatsappSession`,
                  {
                    action: "update",
                    session: whatsapp
                  }
                );

                removeWbot(id, false);

                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  5000
                );

                return;
              } else if (statusCode === 401) {
                logger.error("Device removido pelo WhatsApp. Sessão inválida.");

                hasOpened = false;
                (wsocket as any).isAlive = false;

                await whatsapp.update({
                  status: "PENDING",
                  session: "",
                  qrcode: null
                });

                await DeleteBaileysService(whatsapp.id);
                removeWbot(id, false);

                // ❌ NÃO reiniciar automaticamente
                return;
              }

              // ⚠️ CLOSE antes da sessão ficar estável
              if (!isStable) {
                logger.warn(
                  `Close (${statusCode}) antes da estabilização — recriando sessão`
                );

                hasOpened = false;

                removeWbot(id, false);

                setTimeout(
                  () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
                  3000
                );

                return;
              }

              // ✅ Sessão já estável → ignora closes temporários
              logger.warn(
                `Close (${statusCode}) após sessão estável — aguardando reconexão automática`
              );

              // ❌ NÃO apagar auth
              // ❌ NÃO gerar novo QR
              // ❌ NÃO remover do banco
            }

            if (qr !== undefined && !hasOpened) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsappUpdate.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
                await DeleteBaileysService(whatsappUpdate.id);
                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                  "whatsappSession",
                  {
                    action: "update",
                    session: whatsappUpdate
                  }
                );
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(
                  `company-${whatsapp.companyId}-whatsappSession`,
                  {
                    action: "update",
                    session: whatsapp
                  }
                );
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveState);
      })();
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      reject(error);
    }
  });
};
