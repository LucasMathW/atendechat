import * as Sentry from "@sentry/node";
import BullQueue from "bull";
import { MessageData, SendMessage } from "./helpers/SendMessage";
import Whatsapp from "./models/Whatsapp";
import { logger } from "./utils/logger";
import moment from "moment";
import Schedule from "./models/Schedule";
import Contact from "./models/Contact";
import { Op, QueryTypes, Sequelize } from "sequelize";
import GetDefaultWhatsApp from "./helpers/GetDefaultWhatsApp";
import Campaign from "./models/Campaign";
import ContactList from "./models/ContactList";
import ContactListItem from "./models/ContactListItem";
import { isEmpty, isNil, isArray } from "lodash";
import CampaignSetting from "./models/CampaignSetting";
import CampaignShipping from "./models/CampaignShipping";
import GetWhatsappWbot from "./helpers/GetWhatsappWbot";
import sequelize from "./database";
import { getMessageOptions } from "./services/WbotServices/SendWhatsAppMedia";
import { getIO } from "./libs/socket";
import path from "path";
import User from "./models/User";
import Company from "./models/Company";
import Plan from "./models/Plan";
import Ticket from "./models/Ticket";
import ShowFileService from "./services/FileServices/ShowService";
import FilesOptions from './models/FilesOptions';
import { addSeconds, differenceInSeconds } from "date-fns";
import formatBody from "./helpers/Mustache";
import { ClosedAllOpenTickets } from "./services/WbotServices/wbotClosedTickets";


const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;

const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;

interface ProcessCampaignData {
  id: number;
  delay: number;
}

interface PrepareContactData {
  contactId: number;
  campaignId: number;
  delay: number;
  variables: any[];
}

interface DispatchCampaignData {
  campaignId: number;
  campaignShippingId: number;
  contactListItemId: number;
}

export const userMonitor = new BullQueue("UserMonitor", connection);

export const queueMonitor = new BullQueue("QueueMonitor", connection);

export const messageQueue = new BullQueue("MessageQueue", connection, {
  limiter: {
    max: limiterMax as number,
    duration: limiterDuration as number
  }
});

export const scheduleMonitor = new BullQueue("ScheduleMonitor", connection);
export const sendScheduledMessages = new BullQueue(
  "SendScheduledMessages",
  connection
);

export const campaignQueue = new BullQueue("CampaignQueue", connection);

async function handleSendMessage(job) {
  try {
    const { data } = job;

    const whatsapp = await Whatsapp.findByPk(data.whatsappId);

    if (whatsapp == null) {
      throw Error("Whatsapp não identificado");
    }

    const messageData: MessageData = data.data;

    await SendMessage(whatsapp, messageData);
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("MessageQueue -> SendMessage: error", e.message);
    throw e;
  }
}

{/*async function handleVerifyQueue(job) {
  logger.info("Buscando atendimentos perdidos nas filas");
  try {
    const companies = await Company.findAll({
      attributes: ['id', 'name'],
      where: {
        status: true,
        dueDate: {
          [Op.gt]: Sequelize.literal('CURRENT_DATE')
        }
      },
      include: [
        {
          model: Whatsapp, attributes: ["id", "name", "status", "timeSendQueue", "sendIdQueue"], where: {
            timeSendQueue: {
              [Op.gt]: 0
            }
          }
        },
      ]
    }); */}

{/*    companies.map(async c => {
      c.whatsapps.map(async w => {

        if (w.status === "CONNECTED") {

          var companyId = c.id;

          const moveQueue = w.timeSendQueue ? w.timeSendQueue : 0;
          const moveQueueId = w.sendIdQueue;
          const moveQueueTime = moveQueue;
          const idQueue = moveQueueId;
          const timeQueue = moveQueueTime;

          if (moveQueue > 0) {

            if (!isNaN(idQueue) && Number.isInteger(idQueue) && !isNaN(timeQueue) && Number.isInteger(timeQueue)) {

              const tempoPassado = moment().subtract(timeQueue, "minutes").utc().format();
              // const tempoAgora = moment().utc().format();

              const { count, rows: tickets } = await Ticket.findAndCountAll({
                where: {
                  status: "pending",
                  queueId: null,
                  companyId: companyId,
                  whatsappId: w.id,
                  updatedAt: {
                    [Op.lt]: tempoPassado
                  }
                },
                include: [
                  {
                    model: Contact,
                    as: "contact",
                    attributes: ["id", "name", "number", "email", "profilePicUrl"],
                    include: ["extraInfo"]
                  }
                ]
              });

              if (count > 0) {
                tickets.map(async ticket => {
                  await ticket.update({
                    queueId: idQueue
                  });

                  await ticket.reload();

                  const io = getIO();
                  io.to(ticket.status)
                    .to("notification")
                    .to(ticket.id.toString())
                    .emit(`company-${companyId}-ticket`, {
                      action: "update",
                      ticket,
                      ticketId: ticket.id
                    });

                  // io.to("pending").emit(`company-${companyId}-ticket`, {
                  //   action: "update",
                  //   ticket,
                  // });

                  logger.info(`Atendimento Perdido: ${ticket.id} - Empresa: ${companyId}`);
                });
              } else {
                logger.info(`Nenhum atendimento perdido encontrado - Empresa: ${companyId}`);
              }
            } else {
              logger.info(`Condição não respeitada - Empresa: ${companyId}`);
            }
          }
        }
      });
    });
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SearchForQueue -> VerifyQueue: error", e.message);
    throw e;
  }
}; */}

async function handleCloseTicketsAutomatic() {
  const job = new CronJob('*/1 * * * *', async () => {
    const companies = await Company.findAll();
    companies.map(async c => {

      try {
        const companyId = c.id;
        await ClosedAllOpenTickets(companyId);
      } catch (e: any) {
        Sentry.captureException(e);
        logger.error("ClosedAllOpenTickets -> Verify: error", e.message);
        throw e;
      }

    });
  });
  job.start()
}

async function handleVerifySchedules(job) {
  try {
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: {
        status: "PENDENTE",
        sentAt: null,
        sendAt: {
          [Op.gte]: moment().format("YYYY-MM-DD HH:mm:ss"),
          [Op.lte]: moment().add("300", "seconds").format("YYYY-MM-DD HH:mm:ss")
        }
      },
      include: [{ model: Contact, as: "contact" }]
    });
    if (count > 0) {
      schedules.map(async schedule => {
        await schedule.update({
          status: "AGENDADA"
        });
        sendScheduledMessages.add(
          "SendMessage",
          { schedule },
          { delay: 40000 }
        );
        logger.info(`[🧵] Disparo agendado para: ${schedule.contact.name}`);
      });
    }
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SendScheduledMessage -> Verify: error", e.message);
    throw e;
  }
}

async function handleSendScheduledMessage(job) {
  const {
    data: { schedule }
  } = job;
  let scheduleRecord: Schedule | null = null;

  try {
    scheduleRecord = await Schedule.findByPk(schedule.id);
  } catch (e) {
    Sentry.captureException(e);
    logger.info(`Erro ao tentar consultar agendamento: ${schedule.id}`);
  }

  try {
    const whatsapp = await GetDefaultWhatsApp(schedule.companyId);

    let filePath = null;
    if (schedule.mediaPath) {
      filePath = path.resolve("public", schedule.mediaPath);
    }

    await SendMessage(whatsapp, {
      number: schedule.contact.number,
      body: formatBody(schedule.body, schedule.contact),
      mediaPath: filePath
    });

    await scheduleRecord?.update({
      sentAt: moment().format("YYYY-MM-DD HH:mm"),
      status: "ENVIADA"
    });

    logger.info(`[🧵] Mensagem agendada enviada para: ${schedule.contact.name}`);
    sendScheduledMessages.clean(15000, "completed");
  } catch (e: any) {
    Sentry.captureException(e);
    await scheduleRecord?.update({
      status: "ERRO"
    });
    logger.error("SendScheduledMessage -> SendMessage: error", e.message);
    throw e;
  }
}

async function handleVerifyCampaigns(job) {
  /**
   * @todo
   * Implementar filtro de campanhas
   */

  logger.info("[🏁] - Verificando campanhas...");

  const campaigns: { id: number; scheduledAt: string }[] =
    await sequelize.query(
      `select id, "scheduledAt" from "Campaigns" c
    where "scheduledAt" between now() and now() + '1 hour'::interval and status = 'PROGRAMADA'`,
      { type: QueryTypes.SELECT }
    );

  if (campaigns.length > 0)
    logger.info(`[🚩] - Campanhas encontradas: ${campaigns.length}`);

  for (let campaign of campaigns) {
    try {
      const now = moment();
      const scheduledAt = moment(campaign.scheduledAt);
      const delay = scheduledAt.diff(now, "milliseconds");
      logger.info(
        `[📌] - Campanha enviada para a fila de processamento: Campanha=${campaign.id}, Delay Inicial=${delay}`
      );
      campaignQueue.add(
        "ProcessCampaign",
        {
          id: campaign.id,
          delay
        },
        {
          removeOnComplete: true
        }
      );
    } catch (err: any) {
      Sentry.captureException(err);
    }
  }

  logger.info("[🏁] - Finalizando verificação de campanhas programadas...");
}

async function getCampaign(id) {
  return await Campaign.findByPk(id, {
    include: [
      {
        model: ContactList,
        as: "contactList",
        attributes: ["id", "name"],
        include: [
          {
            model: ContactListItem,
            as: "contacts",
            attributes: ["id", "name", "number", "email", "isWhatsappValid"],
            where: { isWhatsappValid: true }
          }
        ]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: CampaignShipping,
        as: "shipping",
        include: [{ model: ContactListItem, as: "contact" }]
      }
    ]
  });
}

async function getContact(id) {
  return await ContactListItem.findByPk(id, {
    attributes: ["id", "name", "number", "email"]
  });
}

async function getSettings(campaign) {
  const settings = await CampaignSetting.findAll({
    where: { companyId: campaign.companyId },
    attributes: ["key", "value"]
  });

  let messageInterval: number = 20;
  let longerIntervalAfter: number = 20;
  let greaterInterval: number = 60;
  let variables: any[] = [];

  settings.forEach(setting => {
    if (setting.key === "messageInterval") {
      messageInterval = JSON.parse(setting.value);
    }
    if (setting.key === "longerIntervalAfter") {
      longerIntervalAfter = JSON.parse(setting.value);
    }
    if (setting.key === "greaterInterval") {
      greaterInterval = JSON.parse(setting.value);
    }
    if (setting.key === "variables") {
      variables = JSON.parse(setting.value);
    }
  });

  return {
    messageInterval,
    longerIntervalAfter,
    greaterInterval,
    variables
  };
}

export function parseToMilliseconds(seconds) {
  return seconds * 1000;
}

async function sleep(seconds) {
  logger.info(
    `Sleep de ${seconds} segundos iniciado: ${moment().format("HH:mm:ss")}`
  );
  return new Promise(resolve => {
    setTimeout(() => {
      logger.info(
        `Sleep de ${seconds} segundos finalizado: ${moment().format(
          "HH:mm:ss"
        )}`
      );
      resolve(true);
    }, parseToMilliseconds(seconds));
  });
}

function getCampaignValidMessages(campaign) {
  const messages = [];

  if (!isEmpty(campaign.message1) && !isNil(campaign.message1)) {
    messages.push(campaign.message1);
  }

  if (!isEmpty(campaign.message2) && !isNil(campaign.message2)) {
    messages.push(campaign.message2);
  }

  if (!isEmpty(campaign.message3) && !isNil(campaign.message3)) {
    messages.push(campaign.message3);
  }

  if (!isEmpty(campaign.message4) && !isNil(campaign.message4)) {
    messages.push(campaign.message4);
  }

  if (!isEmpty(campaign.message5) && !isNil(campaign.message5)) {
    messages.push(campaign.message5);
  }

  return messages;
}

function getProcessedMessage(msg: string, variables: any[], contact: any) {
  let finalMessage = msg;

  if (finalMessage.includes("{nome}")) {
    finalMessage = finalMessage.replace(/{nome}/g, contact.name);
  }

  if (finalMessage.includes("{email}")) {
    finalMessage = finalMessage.replace(/{email}/g, contact.email);
  }

  if (finalMessage.includes("{numero}")) {
    finalMessage = finalMessage.replace(/{numero}/g, contact.number);
  }

  variables.forEach(variable => {
    if (finalMessage.includes(`{${variable.key}}`)) {
      const regex = new RegExp(`{${variable.key}}`, "g");
      finalMessage = finalMessage.replace(regex, variable.value);
    }
  });

  return finalMessage;
}

export function randomValue(min, max) {
  return Math.floor(Math.random() * max) + min;
}

async function verifyAndFinalizeCampaign(campaign) {

  logger.info("[🚨] - Verificando se o envio de campanhas finalizou");
  const { contacts } = campaign.contactList;

  const count1 = contacts.length;
  const count2 = await CampaignShipping.count({
    where: {
      campaignId: campaign.id,
      deliveredAt: {
        [Op.not]: null
      }
    }
  });

  if (count1 === count2) {
    await campaign.update({ status: "FINALIZADA", completedAt: moment() });
  }

  const io = getIO();
  io.to(`company-${campaign.companyId}-mainchannel`).emit(`company-${campaign.companyId}-campaign`, {
    action: "update",
    record: campaign
  });

  logger.info("[🚨] - Fim da verificação de finalização de campanhas");
}

function calculateDelay(index, baseDelay, longerIntervalAfter, greaterInterval, messageInterval) {
  const diffSeconds = differenceInSeconds(baseDelay, new Date());
  if (index > longerIntervalAfter) {
    return diffSeconds * 1000 + greaterInterval
  } else {
    return diffSeconds * 1000 + messageInterval
  }
}

async function getCampaignContacts(campaignId: number, batchSize: number = 100, offset: number = 0) {
  // Primeiro, busca a campanha para obter o contactListId
  const campaign = await Campaign.findByPk(campaignId, {
    attributes: ['contactListId']
  });

  if (!campaign || !campaign.contactListId) {
    return [];
  }

  // Busca contatos da lista de contatos com paginação
  return await ContactListItem.findAll({
    attributes: ['id', 'name', 'number', 'email'],
    where: {
      contactListId: campaign.contactListId,
      isWhatsappValid: true
    },
    limit: batchSize,
    offset: offset
  });
}

async function handleProcessCampaign(job) {
  const startTime = Date.now();
  logger.info("[🏁] - Iniciou o processamento da campanha de ID: " + job.data.id);
  
  try {
    const { id }: ProcessCampaignData = job.data;
    
    // Carrega apenas dados essenciais da campanha
    const campaign = await Campaign.findByPk(id, {
      attributes: ['id', 'companyId', 'scheduledAt', 'status', 'contactListId'],
      include: [{
        model: Whatsapp,
        as: 'whatsapp',
        attributes: ['id', 'name']
      }]
    });

    if (!campaign) {
      logger.error(`[🚨] - Campanha não encontrada: ${id}`);
      return;
    }

    if (!campaign.contactListId) {
      logger.error(`[🚨] - Campanha ${id} não possui lista de contatos associada`);
      return;
    }

    const settings = await getSettings(campaign);
    const batchSize = process.env.CAMPAIGN_BATCH_SIZE ? parseInt(process.env.CAMPAIGN_BATCH_SIZE) : 30;
    const rateLimit = process.env.CAMPAIGN_RATE_LIMIT ? parseInt(process.env.CAMPAIGN_RATE_LIMIT) : 5000;
    let offset = 0;
    let hasMoreContacts = true;
    let totalProcessed = 0;

    logger.info(`[📊] - Iniciando processamento da campanha ${id} com batchSize: ${batchSize}`);

    while (hasMoreContacts) {
      const contacts = await getCampaignContacts(id, batchSize, offset);
      
      if (contacts.length === 0) {
        logger.info(`[📊] - Nenhum contato encontrado para a campanha ${id}`);
        hasMoreContacts = false;
        continue;
      }

      logger.info(`[📊] - Processando lote de ${contacts.length} contatos para campanha ${id} (offset: ${offset})`);

      const baseDelay = campaign.scheduledAt;
      const longerIntervalAfter = parseToMilliseconds(settings.longerIntervalAfter);
      const greaterInterval = parseToMilliseconds(settings.greaterInterval);
      const messageInterval = settings.messageInterval;

      const queuePromises = contacts.map((contact, index) => {
        const delay = calculateDelay(
          offset + index,
          baseDelay,
          longerIntervalAfter,
          greaterInterval,
          messageInterval
        );

        return campaignQueue.add(
          "PrepareContact",
          {
            contactId: contact.id,
            campaignId: campaign.id,
            variables: settings.variables,
            delay
          },
          { 
            removeOnComplete: true,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000
            }
          }
        );
      });

      await Promise.all(queuePromises);
      totalProcessed += contacts.length;
      offset += contacts.length;

      // Se o número de contatos retornados é menor que o batchSize, significa que chegamos ao fim
      if (contacts.length < batchSize) {
        hasMoreContacts = false;
        logger.info(`[📊] - Último lote processado para campanha ${id}. Total de contatos: ${totalProcessed}`);
      }

      // Log do progresso
      logger.info(`[📊] - Progresso da campanha ${id}:`, {
        processed: totalProcessed,
        currentBatch: contacts.length,
        offset: offset,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      });

      // Pausa entre batches para não sobrecarregar o sistema
      await new Promise(resolve => setTimeout(resolve, rateLimit));
    }

    await campaign.update({ status: "EM_ANDAMENTO" });
    
    const duration = Date.now() - startTime;
    logger.info(`[✅] - Campanha ${id} processada com sucesso:`, {
      totalContacts: totalProcessed,
      duration: `${Math.round(duration / 1000)}s`,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });

  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(`[🚨] - Erro ao processar campanha ${job.data.id}:`, {
      error: err.message,
      stack: err.stack,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });

    // Tenta reprocessar o job em caso de erro
    if (job.attemptsMade < 3) {
      logger.info(`[🔄] - Tentativa ${job.attemptsMade + 1} de 3 para campanha ${job.data.id}`);
      await job.retry();
    } else {
      logger.error(`[🚨] - Job falhou após 3 tentativas: ${job.data.id}`);
    }
  }
}

async function handlePrepareContact(job) {
  logger.info("Preparando contatos");
  try {
    const { contactId, campaignId, delay, variables }: PrepareContactData =
      job.data;
    
    logger.info(`[🏁] - Iniciou a preparação do contato | contatoId: ${contactId} CampanhaID: ${campaignId}`);

    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      logger.error(`[🚨] - Campanha ${campaignId} não encontrada`);
      return;
    }

    const contact = await getContact(contactId);
    if (!contact) {
      logger.error(`[🚨] - Contato ${contactId} não encontrado`);
      return;
    }

    // Verifica se já existe um registro de envio para este contato nesta campanha
    const existingShipping = await CampaignShipping.findOne({
      where: {
        campaignId: campaignId,
        contactId: contactId
      }
    });

    if (existingShipping && existingShipping.deliveredAt) {
      logger.info(`[📊] - Contato ${contactId} já foi enviado na campanha ${campaignId}`);
      return;
    }

    const campaignShipping: any = {};
    campaignShipping.number = contact.number;
    campaignShipping.contactId = contactId;
    campaignShipping.campaignId = campaignId;

    const messages = getCampaignValidMessages(campaign);
    if (messages.length) {
      const radomIndex = randomValue(0, messages.length);
      const message = getProcessedMessage(
        messages[radomIndex],
        variables,
        contact
      );
      campaignShipping.message = `\u200c ${message}`;
    }

    const [record, created] = await CampaignShipping.findOrCreate({
      where: {
        campaignId: campaignShipping.campaignId,
        contactId: campaignShipping.contactId
      },
      defaults: campaignShipping
    });

    logger.info(`[🚩] - Registro de envio de campanha para contato criado | contatoId: ${contactId} CampanhaID: ${campaignId}`);

    if (
      !created &&
      record.deliveredAt === null
    ) {
      record.set(campaignShipping);
      await record.save();
    }

    if (
      record.deliveredAt === null
    ) {
      const nextJob = await campaignQueue.add(
        "DispatchCampaign",
        {
          campaignId: campaign.id,
          campaignShippingId: record.id,
          contactListItemId: contactId
        },
        {
          delay
        }
      );

      await record.update({ jobId: nextJob.id });
    }

    await verifyAndFinalizeCampaign(campaign);
    logger.info(`[🏁] - Finalizado a preparação do contato | contatoId: ${contactId} CampanhaID: ${campaignId}`);
  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(`[🚨] - campaignQueue -> PrepareContact -> error: ${err.message}`, {
      contactId: job.data.contactId,
      campaignId: job.data.campaignId,
      error: err.message,
      stack: err.stack
    });
  }
}

async function handleDispatchCampaign(job) {
  try {
    const { data } = job;
    const { campaignShippingId, campaignId }: DispatchCampaignData = data;
    
    logger.info(`[🏁] - Disparando campanha | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      logger.error(`[🚨] - Campanha ${campaignId} não encontrada`);
      return;
    }

    const wbot = await GetWhatsappWbot(campaign.whatsapp);

    if (!wbot) {
      logger.error(`[🚨] - Wbot não encontrado para campanha ${campaignId}`);
      return;
    }

    if (!campaign.whatsapp) {
      logger.error(`[🚨] - WhatsApp não encontrado para campanha ${campaignId}`);
      return;
    }

    if (!wbot?.user?.id) {
      logger.error(`[🚨] - Usuário do wbot não encontrado para campanha ${campaignId}`);
      return;
    }

    logger.info(`[🚩] - Disparando campanha | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

    const campaignShipping = await CampaignShipping.findByPk(
      campaignShippingId,
      {
        include: [{ model: ContactListItem, as: "contact" }]
      }
    );

    if (!campaignShipping) {
      logger.error(`[🚨] - CampaignShipping ${campaignShippingId} não encontrado`);
      return;
    }

    const chatId = `${campaignShipping.number}@s.whatsapp.net`;

    let body = campaignShipping.message;

    if (!isNil(campaign.fileListId)) {
      logger.info(`[🚩] - Recuperando a lista de arquivos | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

      try {
        const publicFolder = path.resolve(__dirname, "..", "public");
        const files = await ShowFileService(campaign.fileListId, campaign.companyId)
        const folder = path.resolve(publicFolder, "fileList", String(files.id))
        for (const [index, file] of files.options.entries()) {
          const options = await getMessageOptions(file.path, path.resolve(folder, file.path), file.name);
          await wbot.sendMessage(chatId, { ...options });

          logger.info(`[🚩] - Enviou arquivo: ${file.name} | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);
        };
      } catch (error) {
        logger.error(`[🚨] - Erro ao enviar arquivos: ${error.message}`);
      }
    }

    if (campaign.mediaPath) {
      logger.info(`[🚩] - Preparando mídia da campanha: ${campaign.mediaPath} | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

      const publicFolder = path.resolve(__dirname, "..", "public");
      const filePath = path.join(publicFolder, campaign.mediaPath);

      const options = await getMessageOptions(campaign.mediaName, filePath, body);
      if (Object.keys(options).length) {
        await wbot.sendMessage(chatId, { ...options });
      }
    }
    else {
      logger.info(`[🚩] - Enviando mensagem de texto da campanha | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

      await wbot.sendMessage(chatId, {
        text: body
      });
    }

    logger.info(`[🚩] - Atualizando campanha para enviada... | CampaignShippingId: ${campaignShippingId} CampanhaID: ${campaignId}`);

    await campaignShipping.update({ deliveredAt: moment() });

    await verifyAndFinalizeCampaign(campaign);

    const io = getIO();
    io.to(`company-${campaign.companyId}-mainchannel`).emit(`company-${campaign.companyId}-campaign`, {
      action: "update",
      record: campaign
    });

    logger.info(
      `[🏁] - Campanha enviada para: Campanha=${campaignId};Contato=${campaignShipping.contact.name}`
    );

  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(`[🚨] - Erro ao disparar campanha: ${err.message}`, {
      campaignShippingId: job.data.campaignShippingId,
      campaignId: job.data.campaignId,
      error: err.message,
      stack: err.stack
    });
  }
}

async function handleLoginStatus(job) {
  const users: { id: number }[] = await sequelize.query(
    `select id from "Users" where "updatedAt" < now() - '5 minutes'::interval and online = true`,
    { type: QueryTypes.SELECT }
  );
  for (let item of users) {
    try {
      const user = await User.findByPk(item.id);
      await user.update({ online: false });
      logger.info(`Usuário passado para offline: ${item.id}`);
    } catch (e: any) {
      Sentry.captureException(e);
    }
  }
}


async function handleInvoiceCreate() {
  logger.info("Iniciando geração de boletos");
  const job = new CronJob('*/5 * * * * *', async () => {


    const companies = await Company.findAll();
    companies.map(async c => {
      var dueDate = c.dueDate;
      const date = moment(dueDate).format();
      const timestamp = moment().format();
      const hoje = moment(moment()).format("DD/MM/yyyy");
      var vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
      var dias = moment.duration(diff).asDays();

      if (dias < 20) {
        const plan = await Plan.findByPk(c.planId);

        const sql = `SELECT COUNT(*) mycount FROM "Invoices" WHERE "companyId" = ${c.id} AND "dueDate"::text LIKE '${moment(dueDate).format("yyyy-MM-DD")}%';`
        const invoice = await sequelize.query(sql,
          { type: QueryTypes.SELECT }
        );
        if (invoice[0]['mycount'] > 0) {

        } else {
          const sql = `INSERT INTO "Invoices" (detail, status, value, "updatedAt", "createdAt", "dueDate", "companyId")
          VALUES ('${plan.name}', 'open', '${plan.value}', '${timestamp}', '${timestamp}', '${date}', ${c.id});`

          const invoiceInsert = await sequelize.query(sql,
            { type: QueryTypes.INSERT }
          );

          /*           let transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: 'email@gmail.com',
                        pass: 'senha'
                      }
                    });

                    const mailOptions = {
                      from: 'heenriquega@gmail.com', // sender address
                      to: `${c.email}`, // receiver (use array of string for a list)
                      subject: 'Fatura gerada - Sistema', // Subject line
                      html: `Olá ${c.name} esté é um email sobre sua fatura!<br>
          <br>
          Vencimento: ${vencimento}<br>
          Valor: ${plan.value}<br>
          Link: ${process.env.FRONTEND_URL}/financeiro<br>
          <br>
          Qualquer duvida estamos a disposição!
                      `// plain text body
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                      if (err)
                        console.log(err)
                      else
                        console.log(info);
                    }); */

        }





      }

    });
  });
  job.start()
}

handleCloseTicketsAutomatic()

handleInvoiceCreate()

export async function startQueueProcess() {

  logger.info("[🏁] - Iniciando processamento de filas");

  messageQueue.process("SendMessage", handleSendMessage);

  scheduleMonitor.process("Verify", handleVerifySchedules);

  sendScheduledMessages.process("SendMessage", handleSendScheduledMessage);

  userMonitor.process("VerifyLoginStatus", handleLoginStatus);


  campaignQueue.process("VerifyCampaigns", 1, handleVerifyCampaigns);

  campaignQueue.process("ProcessCampaign", 1, handleProcessCampaign);

  campaignQueue.process("PrepareContact", 1, handlePrepareContact);

  campaignQueue.process("DispatchCampaign", 1, handleDispatchCampaign);


  //queueMonitor.process("VerifyQueueStatus", handleVerifyQueue);

  async function cleanupCampaignQueue() {
    try {
      await campaignQueue.clean(12 * 3600 * 1000, 'completed');
      await campaignQueue.clean(24 * 3600 * 1000, 'failed');

      const jobs = await campaignQueue.getJobs(['waiting', 'active']);
      for (const job of jobs) {
        if (Date.now() - job.timestamp > 24 * 3600 * 1000) {
          await job.remove();
        }
      }
    } catch (error) {
      logger.error('[🚨] - Erro na limpeza da fila de campanhas:', error);
    }
  }
  setInterval(cleanupCampaignQueue, 6 * 3600 * 1000);

  setInterval(async () => {
    const jobCounts = await campaignQueue.getJobCounts();
    const memoryUsage = process.memoryUsage();

    logger.info('[📌] - Status da fila de campanhas:', {
      jobs: jobCounts,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
      }
    });
  }, 5 * 60 * 1000);

  campaignQueue.on('completed', (job) => {
    logger.info(`[📌] -   Campanha ${job.id} completada em ${Date.now() - job.timestamp}ms`);
  });

  scheduleMonitor.add(
    "Verify",
    {},
    {
      repeat: { cron: "*/5 * * * * *", key: "verify" },
      removeOnComplete: true
    }
  );

  campaignQueue.add(
    "VerifyCampaigns",
    {},
    {
      repeat: { cron: "*/20 * * * * *", key: "verify-campaing" },
      removeOnComplete: true
    }
  );

  userMonitor.add(
    "VerifyLoginStatus",
    {},
    {
      repeat: { cron: "* * * * *", key: "verify-login" },
      removeOnComplete: true
    }
  );

  queueMonitor.add(
    "VerifyQueueStatus",
    {},
    {
      repeat: { cron: "*/20 * * * * *" },
      removeOnComplete: true
    }
  );
}
