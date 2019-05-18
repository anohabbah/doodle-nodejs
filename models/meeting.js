'use strict';

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
      otherKey: 'participant_id'
    });
    Meeting.hasMany(Survey, { as: 'survey' });
  };

  return Meeting;
};