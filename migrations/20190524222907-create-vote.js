'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('votes', {
      voter_id: {
        unique: 'vote',
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      voteable: {
        unique: 'vote',
        type: Sequelize.STRING
      },
      voteable_id: {
        unique: 'vote',
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('votes');
  }
};
