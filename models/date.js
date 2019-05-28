'use strict';
module.exports = (sequelize, DataTypes) => {
  const Date = sequelize.define(
    'Date',
    {
      timestamp: DataTypes.DATE
    },
    { timestamps: false }
  );
  Date.associate = function({ Survey, Vote }) {
    Date.belongsTo(Survey, { as: 'survey' });

    Date.hasMany(Vote, {
      foreignKey: 'voteableId',
      constraints: false,
      scope: { voteable: 'Date' }
    });
  };

  return Date;
};
