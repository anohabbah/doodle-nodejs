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
    { timestamps: false }
  );

  Location.associate = function({ Survey, Vote }) {
    Location.belongsTo(Survey, { as: 'survey' });

    Location.hasMany(Vote, {
      foreignKey: 'voteableId',
      constraints: false,
      scope: { voteable: 'Location' }
    });
  };

  return Location;
};
