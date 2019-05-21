'use strict';

// TODO: For security reasons think to override validation messages
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
    {
      hooks: {
        async afterCreate(instance, options) {
          const link = 'http://127.0.0.1:3000/api/surveys/1';
          await instance.update({ link });
        }
      }
    }
  );

  Survey.associate = function({ Meeting, User, Location }) {
    Survey.belongsTo(Meeting, { as: 'meeting' });
    Survey.belongsToMany(User, { as: 'voters', through: 'SurveyVoter' });
    Survey.hasMany(Location, { as: 'locations' });
  };

  return Survey;
};
