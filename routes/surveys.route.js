const router = require('express').Router();
const { Survey } = require('./../models');

router['post']('/:surveyId/votes', async (req, res) => {
  const surveyId = parseInt(req.params['surveyId'], 10);

  const survey = await Survey.findByPk(surveyId);
  const surveyable = await survey.getSurveys({ where: { meetingId: 1 } });
  const surveyType = surveyable.get('surveyable');
  console.log(surveyType);
});

module.exports = router;
