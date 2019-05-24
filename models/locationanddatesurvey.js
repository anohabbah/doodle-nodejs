'use strict';

module.exports = (sequelize, DataTypes) => {
  const LocationAndDateSurvey = sequelize.define(
    'LocationAndDateSurvey',
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
  LocationAndDateSurvey.associate = function({ Survey, Location, Date }) {
    LocationAndDateSurvey.hasMany(Survey, {
      foreignKey: 'surveyableId',
      constraints: false,
      scope: { surveyable: 'LocationAndDateSurvey' }
    });

    LocationAndDateSurvey.hasMany(Location, {
      foreignKey: 'locationableId',
      constraints: false,
      scope: { locationable: 'LocationAndDateSurvey' }
    });

    LocationAndDateSurvey.hasMany(Date, {
      foreignKey: 'dateableId',
      constraints: false,
      scope: { dateable: 'LocationAndDateSurvey' }
    });
  };

  return LocationAndDateSurvey;
};
