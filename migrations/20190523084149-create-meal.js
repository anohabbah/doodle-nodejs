'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('meals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      survey_id: {
        type: Sequelize.INTEGER,
        references: { model: 'surveys', key: 'id' }
      },
      name: Sequelize.STRING
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('meals');
  }
};
