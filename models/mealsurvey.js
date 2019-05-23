'use strict';

module.exports = (sequelize, DataTypes) => {
  const MealSurvey = sequelize.define(
    'MealSurvey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true, isUrl: true }
      }
    },
    {}
  );
  MealSurvey.associate = function({ Survey }) {
    MealSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'Meal' }
    });
  };
  return MealSurvey;
};
