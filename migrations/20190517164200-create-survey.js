'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('surveys', {
      meeting_id: {
        type: Sequelize.INTEGER,
        references: { model: 'meetings', key: 'id' }
      },
      surveyable: Sequelize.STRING,
      surveyable_id: Sequelize.INTEGER
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('surveys');
  }
};
