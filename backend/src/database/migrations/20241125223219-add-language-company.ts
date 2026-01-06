import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Companies", "language", {
      type: DataTypes.STRING,
      defaultValue: "pt"
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Campaigns", "language");
  }
};
