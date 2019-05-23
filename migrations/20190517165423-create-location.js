'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      surveyable: {
        type: Sequelize.STRING
      },
      surveyable_id: {
        type: Sequelize.INTEGER
      },
      address: {
        type: {
          allowNull: false,
          type: Sequelize.STRING
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('locations');
  }
};
