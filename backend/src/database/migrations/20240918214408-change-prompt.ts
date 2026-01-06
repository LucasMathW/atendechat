import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        
        await queryInterface.removeColumn('Prompts', 'voice');
        await queryInterface.removeColumn('Prompts', 'voiceKey');
        await queryInterface.removeColumn('Prompts', 'voiceRegion');

        await queryInterface.changeColumn('Prompts', 'temperature', {
            type: DataTypes.FLOAT
        });

        await queryInterface.addColumn("Prompts", 'model', {
            type: DataTypes.STRING
        });
    } ,
    down: async (queryInterface: QueryInterface) => {

        await queryInterface.addColumn('Prompts', 'voice', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Prompts', 'voiceKey', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Prompts', 'voiceRegion', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.removeColumn('Prompts', 'model');

        await queryInterface.changeColumn('Prompts', 'temperature', {
            type: DataTypes.INTEGER
        });
    }
}