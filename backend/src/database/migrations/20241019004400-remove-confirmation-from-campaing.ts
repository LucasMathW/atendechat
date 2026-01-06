"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn("Campaigns", "confirmationMessage1")
      .then(() =>
        queryInterface.removeColumn("Campaigns", "confirmationMessage2")
      )
      .then(() =>
        queryInterface.removeColumn("Campaigns", "confirmationMessage3")
      )
      .then(() =>
        queryInterface.removeColumn("Campaigns", "confirmationMessage4")
      )
      .then(() =>
        queryInterface.removeColumn("Campaigns", "confirmationMessage5")
      )
      .then(() => queryInterface.removeColumn("Campaigns", "confirmation"))
      .then(() =>
        queryInterface.removeColumn(
          "CampaignShipping",
          "confirmationRequestedAt"
        )
      )
      .then(() =>
        queryInterface.removeColumn("CampaignShipping", "confirmedAt")
      )
      .then(() =>
        queryInterface.removeColumn("CampaignShipping", "confirmationMessage")
      )
      .then(() =>
        queryInterface.removeColumn("CampaignShipping", "confirmation")
      );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("Campaigns", "confirmationMessage1", {
        type: Sequelize.STRING,
        defaultValue: ""
      })
      .then(() =>
        queryInterface.addColumn("Campaigns", "confirmationMessage2", {
          type: Sequelize.STRING,
          defaultValue: ""
        })
      )
      .then(() =>
        queryInterface.addColumn("Campaigns", "confirmationMessage3", {
          type: Sequelize.STRING,
          defaultValue: ""
        })
      )
      .then(() =>
        queryInterface.addColumn("Campaigns", "confirmationMessage4", {
          type: Sequelize.STRING,
          defaultValue: ""
        })
      )
      .then(() =>
        queryInterface.addColumn("Campaigns", "confirmationMessage5", {
          type: Sequelize.STRING,
          defaultValue: ""
        })
      )
      .then(() =>
        queryInterface.addColumn("Campaigns", "confirmation", {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        })
      )
      .then(() =>
        queryInterface.addColumn(
          "CampaignShipping",
          "confirmationRequestedAt",
          {
            type: Sequelize.DATE
          }
        )
      )
      .then(() =>
        queryInterface.addColumn("CampaignShipping", "confirmedAt", {
          type: Sequelize.DATE
        })
      )
      .then(() =>
        queryInterface.addColumn("CampaignShipping", "confirmationMessage", {
          type: Sequelize.STRING
        })
      )
      .then(() =>
        queryInterface.addColumn("CampaignShipping", "confirmation", {
          type: Sequelize.BOOLEAN
        })
      );
  }
};
