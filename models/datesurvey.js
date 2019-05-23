'use strict';

module.exports = (sequelize, DataTypes) => {
  const DateSurvey = sequelize.define(
    'DateSurvey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true, isUrl: true }
      }
    },
    {}
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
      scope: { surveyable: 'DateSurvey' }
    });
  };

  return DateSurvey;
};
