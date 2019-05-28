const { Sequelize } = require('./../models');
const Joi = require('@hapi/joi');
const { Op } = Sequelize;

exports.createVotes = async (Model, surveyId, voterId, searches) => {
  const voteables = await Model.findAll({
    where: { surveyId, id: { [Op.or]: searches } }
  });

  for (const voteable of voteables) {
    await voteable.createVote({ voterId });
  }
};

exports.validate = request => {
  const schema = {};
  Object.keys(request).forEach(key => {
    // prettier-ignore
    schema[key] = Joi.array()
      .items(Joi.number().integer().positive().required())
      .required();
  });

  const { error } = Joi.validate(request, schema);

  return error;
};
