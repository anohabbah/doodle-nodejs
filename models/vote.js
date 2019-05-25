'use strict';

module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    'Vote',
    {
      voteable: {
        unique: 'vote',
        type: DataTypes.STRING
      },
      voteableId: {
        unique: 'vote',
        type: DataTypes.INTEGER
      }
    },
    {
      getterMethods: {
        getItem(options) {
          return this[
            'get' +
              this.get('voteable')[0].toUpperCase() +
              this.get('voteable').slice(1)
          ](options);
        }
      }
    }
  );
  Vote.associate = function({ User, Meal, Date, Location }) {
    Vote.belongsTo(User, { as: 'voter', foreignKey: 'voterId' });

    Vote.belongsTo(Meal, {
      foreignKey: 'voteableId',
      constraints: false,
      as: 'meal'
    });

    Vote.belongsTo(Date, {
      foreignKey: 'voteableId',
      constraints: false,
      as: 'date'
    });

    Vote.belongsTo(Location, {
      foreignKey: 'voteableId',
      constraints: false,
      as: 'location'
    });
  };

  return Vote;
};
