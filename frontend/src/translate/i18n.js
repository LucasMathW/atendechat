import i18n from "i18next";
import { messages } from "./languages";

const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n.init({
	debug: true,
	defaultNS: ["translations"],
	fallbackLng: "pt",
	ns: ["translations"],
	resources: messages,
	lng: savedLanguage,
});

export const changeLanguage = (language) => {
	i18n.changeLanguage(language);
	localStorage.setItem('i18nextLng', language);
};

export { i18n };