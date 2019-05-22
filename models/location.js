'use strict';

// TODO: For security reasons think to override validation messages
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define(
    'Location',
    {
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
    {}
  );

  Location.associate = function({ Survey, User }) {
    Location.belongsTo(Survey, { as: 'survey' });
    Location.belongsToMany(User, {
      as: 'voters',
      through: 'location_voters',
      foreignKey: 'locationId',
      otherKey: 'voterId'
    });
  };

  return Location;
};
