'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('location_voters', {
      location_id: {
        type: Sequelize.INTEGER,
        references: { model: 'locations', key: 'id' }
      },
      voter_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('location_voters');
  }
};
