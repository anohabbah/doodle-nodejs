const { createVotes, validate } = require('../utils/voteable.util');
const {
  createForbiddenError,
  createNotFoundError
} = require('../utils/create-error.util');
const router = require('express').Router();
const {
  Survey,
  SurveyType,
  Date,
  Meal,
  Meeting,
  Location
} = require('./../models');
const { authMiddleware } = require('../middlewares/auth.middleware');

router['use'](authMiddleware);

router['post']('/:surveyId/votes', async (req, res) => {
  const surveyId = parseInt(req.params['surveyId'], 10);
  const authUserId = parseInt(req['user'], 10);

  const survey = await Survey.findByPk(surveyId, {
    include: [
      { model: SurveyType, as: 'type' },
      { model: Meeting, as: 'meeting' }
    ]
  });
  if (!survey) throw createNotFoundError('Resource not found.');

  const meeting = survey.get('meeting');
  const participants = await meeting['getParticipants']();
  const ids = participants.map(participant => participant.get('id'));
  if (!ids.includes(authUserId))
    throw createForbiddenError('Forbidden action.');

  const surveyType = survey.get('type');

  switch (surveyType.get('name')) {
    case 'DateSurvey': {
      const { selectedDates } = req.body;
      const error = validate({ selectedDates });
      if (error)
        return res.status(422).json({ message: error.details[0].message });

      await createVotes(Date, surveyId, authUserId, selectedDates);

      return res.sendStatus(200);
    }

    case 'LocationSurvey': {
      const { selectedLocations } = req.body;
      const error = validate({ selectedLocations });
      if (error)
        return res.status(422).json({ message: error.details[0].message });

      await createVotes(Location, surveyId, authUserId, selectedLocations);

      return res.sendStatus(200);
    }

    case 'MealSurvey': {
      const { selectedMeals } = req.body;
      const error = validate({ selectedMeals });
      if (error)
        return res.status(422).json({ message: error.details[0].message });

      await createVotes(Meal, surveyId, authUserId, selectedMeals);

      return res.sendStatus(200);
    }

    case 'LocationAndDateSurvey': {
      const { selectedLocations, selectedDates } = req.body;
      const error = validate({ selectedDates, selectedLocations });
      if (error)
        return res.status(422).json({ message: error.details[0].message });

      await createVotes(Location, surveyId, authUserId, selectedLocations);
      await createVotes(Date, surveyId, authUserId, selectedDates);

      return res.sendStatus(200);
    }
  }
});

module.exports = router;
