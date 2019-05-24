const router = require('express').Router();
const { parse } = require('./../utils/app.util');
const {
  Meeting,
  DateSurvey,
  MealSurvey,
  LocationSurvey,
  LocationAndDateSurvey,
  Meal,
  User,
  sequelize,
  Sequelize
} = require('./../models');
const _ = require('lodash');
const {
  createForbiddenError,
  createNotFoundError
} = require('../utils/create-error.util');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { SURVEY_TYPE } = require('../utils/constants.util');

/**
 *
 * @param {Object} transaction
 * @param {string[]} dates
 * @param {number} meetingId
 * @return {Promise<Object>}
 */
async function createDateSurvey(transaction, dates, meetingId) {
  const survey = await DateSurvey.create({}, { transaction });
  for (const timestamp of dates) {
    await survey.createDate({ timestamp }, { transaction });
  }

  await survey.createSurvey({ meetingId }, { transaction });

  const d = await survey.getDates({ attributes: ['id', 'timestamp'] });

  return Object.assign({}, parse(survey), { dates: parse(d) });
}

/**
 *
 * @param {Object} transaction
 * @param {string[]} locations
 * @param {number} meetingId
 * @return {Promise<Object>}
 */
async function createLocationSurvey(transaction, locations, meetingId) {
  const survey = await LocationSurvey.create({}, { transaction });
  for (const address of locations) {
    await survey.createLocation({ address }, { transaction });
  }

  await survey.createSurvey({ meetingId }, { transaction });

  const l = await survey.getLocations({ attributes: ['id', 'address'] });

  return Object.assign({}, parse(survey), { locations: parse(l) });
}

/**
 *
 * @param {string[]} dates
 * @param {string[]} locations
 * @param {Object} transaction
 * @param {number} meetingId
 * @return {Promise<Object>}
 */
async function createLocationAndDateSurvey(
  dates,
  locations,
  transaction,
  meetingId
) {
  const survey = await LocationAndDateSurvey.create({}, { transaction });

  for (const timestamp of dates) {
    await survey.createDate({ timestamp }, { transaction });
  }

  for (const address of locations) {
    await survey.createLocation({ address }, { transaction });
  }

  await survey.createSurvey({ meetingId }, { transaction });

  const l = await survey.getLocations({ attributes: ['id', 'address'] });

  const d = await survey.getDates({ attributes: ['id', 'timestamp'] });

  return Object.assign({}, parse(survey), {
    locations: parse(l),
    dates: parse(d)
  });
}

/**
 *
 * @param {string[]} meals
 * @param {number} meetingId
 * @param {Object} transaction
 * @return {Promise<Object>}
 */
async function createMealSurvey(meals, meetingId, transaction) {
  const survey = await MealSurvey.create({}, { transaction });

  const mMeals = [];
  for (const name of meals) {
    const meal = await Meal.create({ name }, { transaction });
    mMeals.push(meal);
  }

  await survey.setMeals(mMeals);

  await survey.createSurvey({ meetingId }, { transaction });

  return await survey.reload({ include: [{ model: Meal, as: 'meals' }] });
}

router['use'](authMiddleware);

router['get']('/', async (req, res) => {
  const authUserId = parseInt(req['user'], 10);
  const meetings = await Meeting.findAll({ where: { ownerId: authUserId } });
  res.status(200).json(meetings);
});

router['post']('/', (req, res) => {
  const body = req.body;

  Meeting.create(body)
    .then(async meeting => {
      await meeting['setOwner'](parseInt(req['user'], 10));
      res.status(201).json(meeting);
    })
    .catch(err => {
      res
        .status(422)
        .json(err.errors.map(item => _.pick(item, ['path', 'message'])));
    });
});

router['get']('/:meetingId', async (req, res) => {
  const id = parseInt(req.params['meetingId'], 10);

  const meeting = await Meeting.findByPk(id);
  if (!meeting) throw createNotFoundError('Not Found! Resource not found.');

  res.status(200).json(meeting);
});

router['put']('/:meetingId', (req, res, next) => {
  const id = parseInt(req.params['meetingId'], 10);
  const authUserId = parseInt(req['user'], 10);
  const values = req.body;

  Meeting.findByPk(id)
    .then(async meeting => {
      if (!meeting)
        return next(createNotFoundError('Not Found! Resource not found.'));

      if (meeting.ownerId !== authUserId)
        return next(
          createForbiddenError('Forbidden ! Only meeting owner can update it.')
        );

      meeting = await meeting.update(values);
      res.status(200).json(meeting);
    })
    .catch(err =>
      res
        .status(422)
        .json(err.errors.map(item => _.pick(item, ['path', 'message'])))
    );
});

router['delete']('/:meetingId', async (req, res) => {
  const id = parseInt(req.params['meetingId'], 10);
  const authUserId = parseInt(req['user'], 10);

  const meeting = await Meeting.findByPk(id);

  if (!meeting) throw createNotFoundError('Not Found! Resource not found.');

  if (meeting.ownerId !== authUserId)
    throw createForbiddenError('Forbidden ! Only meeting owner can delete it.');

  await meeting.destroy();

  res.status(200).json(meeting);
});

// SURVEYS

router['post']('/:meetingId/surveys', async (req, res) => {
  const survey = await sequelize.transaction(async transaction => {
    const authUserId = parseInt(req['user'], 10);
    const surveyType = parseInt(req.body['surveyType'], 10);
    // const { locations } = req.body;
    const { meetingId } = req.params;

    const meeting = await Meeting.findByPk(meetingId);

    if (!meeting) throw createNotFoundError('Not Found! Resource not found.');

    if (meeting.ownerId !== authUserId)
      throw createForbiddenError(
        'Forbidden ! Only meeting owner can add a survey to it.'
      );

    switch (surveyType) {
      case SURVEY_TYPE.DateSurvey: {
        const { dates } = req.body;
        return await createDateSurvey(transaction, dates, meetingId);
      }

      case SURVEY_TYPE.LocationSurvey: {
        const { locations } = req.body;
        return await createLocationSurvey(transaction, locations, meetingId);
      }

      case SURVEY_TYPE.LocationAndDateSurvey: {
        const { dates, locations } = req.body;
        return await createLocationAndDateSurvey(
          dates,
          locations,
          transaction,
          meetingId
        );
      }

      case SURVEY_TYPE.MealSurvey: {
        const { meals } = req.body;
        return await createMealSurvey(meals, meetingId, transaction);
      }
    }
  });

  res.status(200).json(survey);
});

// INVITATIONS

router['post']('/:meetingId/invitations', async (req, res) => {
  const { participants } = req.body;
  const authUserId = parseInt(req['user'], 10);

  const meeting = await Meeting.findByPk(req.params['meetingId']);
  if (!meeting) throw createNotFoundError('Not Found! Resource not found.');

  if (meeting.ownerId !== authUserId)
    throw createForbiddenError('Forbidden ! Only meeting owner can invite.');

  const Op = Sequelize.Op;
  const users = await User.findAll({
    where: { email: { [Op.in]: participants } }
  });

  if (users.map(user => user.id).includes(authUserId)) {
    throw createForbiddenError('Meeting owner can not invite itself');
  }

  await meeting.setParticipants(users);
  await meeting.reload({
    include: [{ model: User, as: 'participants' }]
  });

  res.status(200).json(meeting);
});

module.exports = router;
