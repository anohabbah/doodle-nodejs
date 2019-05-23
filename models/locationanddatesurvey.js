'use strict';

module.exports = (sequelize, DataTypes) => {
  const LocationAndDateSurvey = sequelize.define(
    'LocationAndDateSurvey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true, isUrl: true }
      }
    },
    {}
  );
  LocationAndDateSurvey.associate = function({ Survey, Location, Date }) {
    LocationAndDateSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'LocationAndDateSurvey' }
    });

    LocationAndDateSurvey.hasMany(Location, {
      foreignKey: 'locationableId',
      constraints: false,
      scope: { surveyable: 'LocationAndDateSurvey' }
    });

    LocationAndDateSurvey.hasMany(Date, {
      foreignKey: 'dateableId',
      constraints: false,
      scope: { surveyable: 'LocationAndDateSurvey' }
    });
  };

  return LocationAndDateSurvey;
};
