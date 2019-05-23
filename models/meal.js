'use strict';

module.exports = (sequelize, DataTypes) => {
  const Meal = sequelize.define(
    'Meal',
    {
      name: DataTypes.STRING
    },
    { timestamps: false }
  );
  Meal.associate = function({ MealSurvey }) {
    Meal.belongsTo(MealSurvey, { as: 'survey' });
  };

  return Meal;
};
