'use strict';

module.exports = (sequelize, DataTypes) => {
  const DateSurvey = sequelize.define(
    'DateSurvey',
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
  DateSurvey.associate = function({ Survey, Date }) {
    DateSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'DateSurvey' }
    });

    DateSurvey.hasMany(Date, {
      foreignKey: 'dateableId',
      constraints: false,
      scope: { dateable: 'DateSurvey' }
    });
  };

  return DateSurvey;
};
