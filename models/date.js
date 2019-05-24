'use strict';
module.exports = (sequelize, DataTypes) => {
  const Date = sequelize.define(
    'Date',
    {
      dateable: DataTypes.STRING,
      dateableId: DataTypes.INTEGER,
      timestamp: DataTypes.DATE
    },
    {
      timestamps: false,
      getterMethods: {
        getItem(options) {
          return this[
            'get' +
              this.get('dateable')[0].toUpperCase() +
              this.get('dateable').slice(1)
          ](options);
        }
      }
    }
  );
  Date.associate = function({ DateSurvey, LocationAndDateSurvey }) {
    Date.belongsTo(DateSurvey, {
      foreignKey: 'dateableId',
      constraints: false,
      as: 'dateSurvey'
    });

    Date.belongsTo(LocationAndDateSurvey, {
      foreignKey: 'dateableId',
      constraints: false,
      as: 'locationAndDateSurvey'
    });
  };

  return Date;
};
