'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('date_surveys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        references: { model: 'meetings', key: 'id' }
      },
      meetingable_id: Sequelize.INTEGER,
      meetingable: {
        defaultValue: 'Date',
        type: Sequelize.STRING
      },
      link: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('date_surveys');
  }
};
