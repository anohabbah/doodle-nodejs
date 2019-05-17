'use strict';
module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    'Survey',
    {
      link: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: true, isUrl: true }
      }
    },
    {}
  );

  Survey.associate = function({ Meeting, User, Location }) {
    Survey.belongsTo(Meeting, { as: 'meeting' });
    Survey.belongsToMany(User, { as: 'voters', through: 'SurveyVoter' });
    Survey.hasMany(Location, { as: 'locations' });
  };

  return Survey;
};
