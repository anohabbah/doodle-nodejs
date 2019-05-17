'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('meeting_participants', {
      meeting_id: {
        type: Sequelize.INTEGER,
        references: { model: 'meetings', key: 'id' }
      },
      participant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('meeting_participants');
  }
};
