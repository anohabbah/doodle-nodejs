'use strict';

module.exports = (sequelize, DataTypes) => {
  const Meal = sequelize.define(
    'Meal',
    {
      name: DataTypes.STRING
    },
    { timestamps: false }
  );
  Meal.associate = function({ MealSurvey, Vote }) {
    Meal.belongsTo(MealSurvey, { as: 'survey' });

    Meal.hasMany(Vote, {
      foreignKey: 'voteableId',
      constraints: false,
      scope: { voteable: 'Meal' }
    });
  };

  return Meal;
};
