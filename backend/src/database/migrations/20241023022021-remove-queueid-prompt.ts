import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async(queryInterface: QueryInterface) => {
      
      await queryInterface.removeColumn('Prompts', 'queueId');
      
    },
    down: async(queryInterface: QueryInterface) => {

      await queryInterface.addColumn('Prompts', 'queueId', {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
        allowNull: false
      })
    }
}