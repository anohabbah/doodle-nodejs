const router = require('express').Router();
const Joi = require('@hapi/joi');
const { Meeting, User, SurveyType, Sequelize } = require('./../models');
const {
  createDateSurvey,
  createMealSurvey,
  createLocationSurvey,
  createLocationAndDateSurvey
} = require('./../utils/survey.util');
const _ = require('lodash');
const {
  createForbiddenError,
  createNotFoundError
} = require('../utils/create-error.util');
const { authMiddleware } = require('../middlewares/auth.middleware');

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
  const authUserId = parseInt(req['user'], 10);
  const { meetingId } = req.params;

  const meeting = await Meeting.findByPk(meetingId);

  if (!meeting) throw createNotFoundError('Not Found! Resource not found.');

  if (meeting.ownerId !== authUserId)
    throw createForbiddenError(
      'Forbidden ! Only meeting owner can add a survey to it.'
    );

  // validate surveyType
  // prettier-ignore
  const {error, value} = Joi.validate(req.body.surveyType, Joi.number().integer().positive().min(1).max(4).required());
  if (error)
    return res.status(422).json({ message: '`surveyType` ' + error.message });

  const surveyType = await SurveyType.findByPk(value);

  let survey;
  switch (surveyType.get('name')) {
    case 'DateSurvey': {
      const { dates } = req.body;

      const { error } = Joi.validate(
        { dates },
        {
          // prettier-ignore
          dates: Joi.array()
            .items(Joi.date().min('now').required())
            .required()
        }
      );
      if (error) return res.status(422).json({ message: error.message });

      survey = await createDateSurvey(dates, meeting, surveyType);
      break;
    }

    case 'LocationSurvey': {
      const { locations } = req.body;

      const { error } = Joi.validate(
        { locations },
        {
          locations: Joi.array()
            .items(Joi.string().required())
            .required()
        }
      );
      if (error) return res.status(422).json({ message: error.message });

      survey = await createLocationSurvey(locations, meeting, surveyType);
      break;
    }

    case 'LocationAndDateSurvey': {
      const { dates, locations } = req.body;

      const { error } = Joi.validate(
        { locations, dates },
        {
          // prettier-ignore
          locations: Joi.array().items(Joi.string().required()).required(),
          // prettier-ignore
          dates: Joi.array()
            .items(Joi.date().min('now').required())
            .required()
        }
      );
      if (error) return res.status(422).json({ message: error.message });

      survey = await createLocationAndDateSurvey(
        dates,
        locations,
        meeting,
        surveyType
      );
      break;
    }

    case 'MealSurvey': {
      const { meals } = req.body;

      const { error } = Joi.validate(
        { meals },
        {
          // prettier-ignore
          meals: Joi.array().items(Joi.string().required()).required()
        }
      );
      if (error) return res.status(422).json({ message: error.message });

      survey = await createMealSurvey(meals, meeting, surveyType);
      break;
    }
  }

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
