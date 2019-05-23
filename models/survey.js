'use strict';

module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    'Survey',
    {
      surveyable: DataTypes.STRING,
      surveyableId: DataTypes.INTEGER
    },
    {
      timestamps: false,
      getterMethods: {
        getItem(options) {
          return this[
            'get' +
              this.get('surveyable')[0].toUpperCase() +
              this.get('surveyable').slice(1)
          ](options);
        }
      }
    }
  );

  Survey.associate = function(models) {
    Survey.belongsTo(models['Meeting'], { as: 'meeting' });

    Survey.belongsTo(models['DateSurvey'], {
      foreignKey: 'surveyableId',
      constraints: false,
      as: 'survey'
    });

    Survey.belongsTo(models['DateAndLocationSurvey'], {
      foreignKey: 'surveyableId',
      constraints: false,
      as: 'survey'
    });

    Survey.belongsTo(models['LocationSurvey'], {
      foreignKey: 'surveyableId',
      constraints: false,
      as: 'survey'
    });

    Survey.belongsTo(models['MealSurvey'], {
      foreignKey: 'surveyableId',
      constraints: false,
      as: 'survey'
    });
  };

  return Survey;
};
