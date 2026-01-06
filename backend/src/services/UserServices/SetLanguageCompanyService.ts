import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const SetLanguageCompanyService = async(
  companyId: number,
  newLanguage: string
) => {

  const company = await Company.findByPk(companyId);

  if( !company )
    throw new AppError("ERR_NO_USER_FOUND", 404);

  if( company.language === newLanguage ) return;

  await company.update({
    language: newLanguage
  });
}

export default SetLanguageCompanyService;
