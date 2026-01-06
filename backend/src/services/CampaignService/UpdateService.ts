import { createContactListFromTag, createContactListFromTagAndContactList } from "../../controllers/CampaignController";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";

interface Data {
  id: number | string;
  name: string;
  status: string;
  scheduledAt: string;
  companyId: number;
  tagId: number | null;
  contactListId: number;
  message1?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
  fileListId: number;
}

const UpdateService = async (data: Data, companyId: number): Promise<Campaign> => {
  const { id } = data;

  const record = await Campaign.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  if (["INATIVA", "PROGRAMADA", "CANCELADA"].indexOf(data.status) === -1) {
    throw new AppError(
      "Só é permitido alterar campanha Inativa e Programada",
      400
    );
  }

  if (
    data.scheduledAt != null &&
    data.scheduledAt != "" &&
    data.status === "INATIVA"
  ) {
    data.status = "PROGRAMADA";
  }

  if(record.tagId !== data.tagId) {
    if (data.tagId && typeof data.contactListId !== 'number') {
      const tagId = data.tagId;
      const campanhaNome = data.name;

      try {
        const contactListId = await createContactListFromTag(tagId, companyId, campanhaNome);

        data.contactListId = contactListId;
        data.tagId = Number(data.tagId);
      } catch (error) {
        throw new AppError('Error creating contact list');
      }
    }

    if (data.tagId && typeof data.contactListId === 'number') {
      const tagId = data.tagId;
      const campanhaNome = data.name;

      try {
        const contactListId = await createContactListFromTagAndContactList(tagId, data.contactListId, companyId, campanhaNome);

        data.contactListId = contactListId;
        data.tagId = Number(data.tagId);
      } catch (error) {
        throw new AppError('Error creating contact list');
      }
    }
  }

  await record.update(data);

  await record.reload({
    include: [
      { model: ContactList },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  return record;
};

export default UpdateService;
