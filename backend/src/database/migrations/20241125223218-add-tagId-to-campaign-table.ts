import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Campaigns", "tagId", {
      type: DataTypes.INTEGER,
      references: { model: "Tags", key: "id" },
      onUpdate: "NO ACTION",
      onDelete: "NO ACTION",
      allowNull: true
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Campaigns", "tagId");
  }
};
