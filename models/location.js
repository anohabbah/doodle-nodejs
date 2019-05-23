'use strict';

// TODO: For security reasons think to override validation messages
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define(
    'Location',
    {
      locationable: DataTypes.STRING,
      locationableId: DataTypes.INTEGER,
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
        set(value) {
          const str = value
            .trim()
            .split(' ')
            .map(
              word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');

          this.setDataValue('address', str);
        }
      }
    },
    { timestamps: false }
  );

  Location.associate = function(models) {
    Location.belongsToMany(models['User'], {
      as: 'voters',
      through: 'location_voters',
      foreignKey: 'locationId',
      otherKey: 'voterId',
      timestamps: false
    });

    Location.belongsTo(models['DateSurvey'], {
      foreignKey: 'locationableId',
      constraints: false,
      as: 'survey'
    });

    Location.belongsTo(models['LocationAndDateSurvey'], {
      foreignKey: 'locationableId',
      constraints: false,
      as: 'survey'
    });
  };

  return Location;
};
