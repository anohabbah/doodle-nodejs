'use strict';

module.exports = (sequelize, DataTypes) => {
  const SurveyType = sequelize.define(
    'SurveyType',
    {
      name: DataTypes.STRING
    },
    {}
  );
  SurveyType.associate = function({ Survey }) {
    SurveyType.hasMany(Survey, { as: 'surveys' });
  };

  return SurveyType;
};
