'use strict';

// TODO: For security reasons think to override validation messages
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define(
    'Location',
    {
      address: {
        type: DataTypes.STRING,
        validate: { notEmpty: true }
      }
    },
    {}
  );

  Location.associate = function({ Survey, User }) {
    Location.belongsTo(Survey, { as: 'meeting' });
    Location.belongsToMany(User, {
      as: 'voters',
      through: 'LocationVoter',
      otherKey: 'voter_id'
    });
  };

  return Location;
};
