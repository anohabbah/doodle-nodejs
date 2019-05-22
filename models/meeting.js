'use strict';

// TODO: For security reasons think to override validation messages
module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define(
    'Meeting',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true, len: [3, 255] }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
      },
      pause: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  Meeting.associate = function({ User, Survey }) {
    Meeting.belongsTo(User, { as: 'owner' });
    Meeting.belongsToMany(User, {
      through: 'MeetingParticipant',
      as: 'participants',
      foreignKey: 'meetingId',
      otherKey: 'participantId'
    });
    Meeting.hasMany(Survey, { as: 'survey' });
  };

  return Meeting;
};
