'use strict';

// TODO: For security reasons think to override validation messages
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
        set(value) {
          const str = value
            .trim()
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          this.setDataValue('name', str);
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { notEmpty: true, isEmail: true },
        set(value) {
          value = value.trim().toLowerCase();
          this.setDataValue('email', value);
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      }
    },
    {}
  );

  User.associate = function({ Meeting, Vote }) {
    User.hasMany(Meeting, { as: 'meetings', foreignKey: 'ownerId' });

    User.hasMany(Vote, { as: 'votes', foreignKey: 'voter_id' });
  };

  return User;
};
