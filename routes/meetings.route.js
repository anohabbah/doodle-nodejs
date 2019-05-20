const router = require('express').Router();
const { Meeting } = require('./../models');
const _ = require('lodash');
const { createForbiddenError } = require('../utils/create-error.util');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createNotFoundError } = require('../utils/create-error.util');

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

module.exports = router;
