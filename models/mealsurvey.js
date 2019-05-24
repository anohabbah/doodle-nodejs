'use strict';

module.exports = (sequelize, DataTypes) => {
  const MealSurvey = sequelize.define(
    'MealSurvey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true }
      }
    },
    {
      hooks: {
        async afterCreate(instance, options) {
          await instance.update({ link: '/surveys/' + instance.id });
        }
      }
    }
  );
  MealSurvey.associate = function({ Survey, Meal }) {
    MealSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'Meal' }
    });

    MealSurvey.hasMany(Meal, { as: 'meals', foreignKey: 'surveyId' });
  };

  return MealSurvey;
};
