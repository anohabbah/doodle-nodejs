const router = require('express').Router();
const { Meeting } = require('./../models');
const _ = require('lodash');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createNotFoundError } = require('../utils/create-error.util');

router['use'](authMiddleware);

router['get']('/', async (req, res) => {
  const meetings = await Meeting.findAll();
  res.status(200).json(meetings);
});

router['post']('/', (req, res) => {
  const body = req.body;

  Meeting.create(body)
    .then(async meeting => {
      await meeting.reload();
      res.status(201).json(meeting);
    })
    .catch(err => {
      res
        .status(422)
        .json(err.errors.map(item => _.pick(item, ['path', 'message'])));
    });
});

router['get']('/:projectId', async (req, res) => {
  const id = parseInt(req.params['projectId'], 10);

  const meeting = await Meeting.findByPk(id);
  if (!meeting) throw createNotFoundError();

  res.status(200).json(meeting);
});

router['put']('/:projectId', (req, res) => {
  const id = parseInt(req.params['projectId'], 10);
  const values = req.body;

  Meeting.findByPk(id)
    .then(async meeting => {
      meeting = await meeting.update(values);
      res.status(200).json(meeting);
    })
    .catch(err =>
      res
        .status(422)
        .json(err.errors.map(item => _.pick(item, ['path', 'message'])))
    );
});

router['delete']('/:projectId', async (req, res) => {
  const id = parseInt(req.params['projectId'], 10);

  const meeting = await Meeting.findByPk(id);
  if (!meeting) throw createNotFoundError();
  await meeting.destroy();

  res.status(200).json(meeting);
});

module.exports = router;
