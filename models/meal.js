'use strict';

module.exports = (sequelize, DataTypes) => {
  const Meal = sequelize.define(
    'Meal',
    {
      name: DataTypes.STRING
    },
    { timestamps: false }
  );
  Meal.associate = function({ Survey, Vote }) {
    Meal.belongsTo(Survey, { as: 'survey' });

    Meal.hasMany(Vote, {
      foreignKey: 'voteableId',
      constraints: false,
      scope: { voteable: 'Meal' }
    });
  };

  return Meal;
};
