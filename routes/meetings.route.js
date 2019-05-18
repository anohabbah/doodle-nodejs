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

module.exports = router;
