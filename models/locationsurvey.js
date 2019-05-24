'use strict';

module.exports = (sequelize, DataTypes) => {
  const LocationSurvey = sequelize.define(
    'LocationSurvey',
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
  LocationSurvey.associate = function({ Survey, Location }) {
    LocationSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'LocationSurvey' }
    });

    LocationSurvey.hasMany(Location, {
      foreignKey: 'locationableId',
      constraints: false,
      scope: { locationable: 'LocationSurvey' }
    });
  };
  return LocationSurvey;
};
