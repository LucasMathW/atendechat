import React, { useEffect, useState } from 'react';
import { changeLanguage, i18n } from "../../translate/i18n";
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import api from "../../services/api";

const LanguageControl = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const handleLanguageChange = async (event) => {
        const newLanguage = event.target.value;
        setSelectedLanguage(newLanguage);
        changeLanguage(newLanguage);

        try{
            await api.post(`/users/set-language/${newLanguage}`);
        }catch(error){
            console.error(error);
        }

    };

    useEffect(() => {
        const saveLanguage = localStorage.getItem('i18nextLng');
        setSelectedLanguage(saveLanguage);
    }, []);

    return (
        <div>
            <label htmlFor="language-select">{i18n.t("selectLanguage")}</label>
            <RadioGroup
                aria-label="language"
                name="language-radio-group"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                row
            >
                <FormControlLabel value="pt" control={<Radio />} label="Português (BR)" />
                <FormControlLabel value="en" control={<Radio />} label="English" />
                <FormControlLabel value="es" control={<Radio />} label="Español" />
            </RadioGroup>
        </div>
    );
};

export default LanguageControl;