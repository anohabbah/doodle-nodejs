const router = require('express').Router();
const { Meeting } = require('./../models');

router.get('/', async (req, res) => {
  const meetings = await Meeting.findAll();
  res.status(200).json(meetings);
});

router.post('/', async (req, res) => {
  const body = req.body;

  const meeting = await Meeting.create(body);
  await meeting.reload();

  res.status(201).json(meeting);
});

router.get('/:projectId', async (req, res) => {
  const id = parseInt(req.params['projectId'], 10);

  const meeting = await Meeting.findByPk(id);

  res.status(200).json(meeting);
});

router.put('/:projectId', async (req, res) => {
  const id = parseInt(req.params['projectId'], 10);
  const values = req.body;

  const meeting = await Meeting.findByPk(id);
  meeting.update(values);

  res.status(200).json(meeting);
});

router.delete('/:projectId', async (req, res) => {
  const id = parseInt(req.params['projectId'], 10);

  const meeting = await Meeting.findByPk(id);
  await meeting.destroy();

  res.status(200).json(meeting);
});

module.exports = router;
