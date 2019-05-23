'use strict';

module.exports = (sequelize, DataTypes) => {
  const LocationSurvey = sequelize.define(
    'LocationSurvey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true, isUrl: true }
      }
    },
    {}
  );
  LocationSurvey.associate = function({ Survey, Location }) {
    LocationSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'LocationSurvey' }
    });

    LocationSurvey.hasMany(Location, {
      foreignKey: 'locationableId',
      constraints: false,
      scope: { surveyable: 'LocationSurvey' }
    });
  };
  return LocationSurvey;
};
