const { parse } = require('./../utils/app.util');
const { Date, sequelize, Survey, Location, Meal } = require('./../models');

/**
 *
 * @param {Object} transaction
 * @param {Meeting} meeting
 * @param {SurveyType} surveyType
 * @return {Promise<Survey>}
 */
async function createSurvey(transaction, meeting, surveyType) {
  const survey = await Survey.create({}, { transaction });
  await survey.setMeeting(meeting, { transaction });
  await survey.setType(surveyType, { transaction });
  return survey;
}

/**
 *
 * @param {string[]} dates
 * @param {Meeting} meeting
 * @param {SurveyType} surveyType
 * @return {Promise<Object>}
 */
async function createDateSurvey(dates, meeting, surveyType) {
  return await sequelize.transaction(async transaction => {
    const survey = await createSurvey(transaction, meeting, surveyType);

    const mDates = [];
    for (const timestamp of dates) {
      const d = await Date.create({ timestamp }, { transaction });
      mDates.push(d);
    }
    await survey.setDates(mDates, { transaction });

    return survey.reload({ include: [{ model: Date, as: 'dates' }] });
  });
}

/**
 *
 * @param {string[]} locations
 * @param {Meeting} meeting
 * @param {SurveyType} surveyType
 * @return {Promise<Object>}
 */
async function createLocationSurvey(locations, meeting, surveyType) {
  return await sequelize.transaction(async transaction => {
    const survey = await createSurvey(transaction, meeting, surveyType);

    const mLocations = [];
    for (const address of locations) {
      const l = await Location.create({ address }, { transaction });
      mLocations.push(l);
    }
    await survey.setLocations(mLocations, { transaction });

    return await survey.reload({
      include: [{ model: Location, as: 'locations' }]
    });
  });
}

/**
 *
 * @param {string[]} dates
 * @param {string[]} locations
 * @param {Meeting} meeting
 * @param {SurveyType} surveyType
 * @return {Promise<Object>}
 */
async function createLocationAndDateSurvey(
  dates,
  locations,
  meeting,
  surveyType
) {
  return await sequelize.transaction(async transaction => {
    const survey = await createSurvey(transaction, meeting, surveyType);

    const mDates = [];
    for (const timestamp of dates) {
      const d = await Date.create({ timestamp }, { transaction });
      mDates.push(d);
    }
    await survey.setDates(mDates, { transaction });

    for (const address of locations) {
      await survey.createLocation({ address }, { transaction });
    }

    const mLocations = [];
    for (const address of locations) {
      const l = await Location.create({ address }, { transaction });
      mLocations.push(l);
    }
    await survey.setLocations(mLocations, { transaction });

    return survey.reload({
      include: [
        { model: Date, as: 'dates' },
        { model: Location, as: 'locations' }
      ]
    });
  });
}

/**
 *
 * @param {string[]} meals
 * @param {Meeting} meeting
 * @param {SurveyType} surveyType
 * @return {Promise<Object>}
 */
async function createMealSurvey(meals, meeting, surveyType) {
  return await sequelize.transaction(async transaction => {
    const survey = await createSurvey(transaction, meeting, surveyType);

    const mMeals = [];
    for (const name of meals) {
      const m = await Meal.create({ name }, { transaction });
      mMeals.push(m);
    }
    await survey.setMeals(mMeals);

    return await survey.reload({ include: [{ model: Meal, as: 'meals' }] });
  });
}

module.exports = {
  createLocationAndDateSurvey,
  createDateSurvey,
  createLocationSurvey,
  createMealSurvey
};
