'use strict';

module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    'Survey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true
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

  Survey.associate = function({ Meeting, SurveyType, Date, Location, Meal }) {
    Survey.belongsTo(Meeting, { as: 'meeting' });

    Survey.belongsTo(SurveyType, { as: 'type', foreignKey: 'typeId' });

    Survey.hasMany(Date, { as: 'dates' });
    Survey.hasMany(Location, { as: 'locations' });
    Survey.hasMany(Meal, { as: 'meals' });
  };

  return Survey;
};
