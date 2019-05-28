const request = require('supertest');
const app = require('./../../app');
const {
  sequelize,
  Meeting,
  User,
  Vote,
  SurveyType
} = require('./../../models');
const { createDateSurvey } = require('./../../utils/survey.util');
const { createSessionToken } = require('./../../utils/security.util');
const Faker = require('faker');
const { createLocationAndDateSurvey } = require('../../utils/survey.util');
const { createMealSurvey } = require('../../utils/survey.util');
const { createLocationSurvey } = require('../../utils/survey.util');

describe('Votes', () => {
  let survey;
  let apiURL;
  const types = [
    'DateSurvey',
    'MealSurvey',
    'LocationSurvey',
    'LocationAndDateSurvey'
  ];
  const dates = [
    Faker.date.future(),
    Faker.date.future(),
    Faker.date.future(),
    Faker.date.future()
  ];
  const locations = [
    Faker.address.streetAddress(true),
    Faker.address.streetAddress(true),
    Faker.address.streetAddress(true)
  ];
  const meals = [Faker.lorem.words(), Faker.lorem.words(), Faker.lorem.words()];
  let meeting;
  let user;
  let sessionTokenString;
  let body;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    body = {
      selectedDates: [1, 3]
    };

    for (const name of types) {
      await SurveyType.create({ name });
    }

    meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.text()
    });

    const u = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });

    user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });
    await meeting.setParticipants([u, user]);

    const sessionToken = await createSessionToken(user);
    sessionTokenString = `SESSIONID=${sessionToken}`;
  });

  const exec = () =>
    request(app)
      .post(apiURL)
      .send(body)
      .set('Cookie', sessionTokenString);

  it('should throw if user is not authenticated', async () => {
    sessionTokenString = '';
    apiURL = `/api/surveys/1/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(401);
  });

  it('should register user votes for Date survey', async () => {
    survey = await createDateSurvey(dates, meeting, 1);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    await user.reload({ include: [{ model: Vote, as: 'votes' }] });
    const map = user.get('votes').map(i => i.voteableId);

    expect(res.statusCode).toBe(200);
    expect(map).toEqual(expect.arrayContaining(body.selectedDates));
  });

  it('should throw if survey does not exist', async () => {
    apiURL = `/api/surveys/5/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(404);
  });

  it('should throw if auth user is not invited to the meeting that the given survey belongs to', async () => {
    survey = await createDateSurvey(dates, meeting, 1);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });

    const sessionToken = await createSessionToken(user);
    sessionTokenString = `SESSIONID=${sessionToken}`;

    const res = await exec();

    expect(res.statusCode).toBe(403);
  });

  it('should register user votes for a location survey', async () => {
    survey = await createLocationSurvey(locations, meeting, 3);
    apiURL = `/api/surveys/${survey.id}/votes`;

    body['selectedLocations'] = [1];

    const res = await exec();

    await user.reload({ include: [{ model: Vote, as: 'votes' }] });
    const map = user.get('votes').map(i => i.get('voteableId'));

    expect(res.statusCode).toBe(200);
    expect(map).toEqual(expect.arrayContaining(body.selectedLocations));
  });

  it('should register user votes for meal survey', async () => {
    survey = await createMealSurvey(meals, meeting, 2);
    apiURL = `/api/surveys/${survey.id}/votes`;

    body['selectedMeals'] = [2, 3];

    const res = await exec();

    await user.reload({ include: [{ model: Vote, as: 'votes' }] });
    const map = user.get('votes').map(i => i.get('voteableId'));

    expect(res.statusCode).toBe(200);
    expect(map).toEqual(expect.arrayContaining(body.selectedMeals));
  });

  it('should register user votes for date and location survey', async () => {
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    body['selectedLocations'] = [2, 3];

    const res = await exec();

    await user.reload({ include: [{ model: Vote, as: 'votes' }] });

    expect(res.statusCode).toBe(200);
    expect(user.get('votes').length).toBe(4);
  });

  it('should require attribute "selectedDates" when voting for a date survey', async () => {
    delete body.selectedDates;
    survey = await createDateSurvey(dates, meeting, 1);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);

    expect(res.body.message).toMatch(/selectedDates/);
    expect(res.body.message).toMatch(/required/);
  });

  it('should require attribute "selectedDates" to be an array when voting for a date survey', async () => {
    body.selectedDates = '';
    survey = await createDateSurvey(dates, meeting, 1);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/selectedDates/);
    expect(res.body.message).toMatch(/array/);
  });

  it('should require attribute "selectedDates" to be an array of integer when voting for a date survey', async () => {
    body.selectedDates = [1, '2', 'st'];
    survey = await createDateSurvey(dates, meeting, 1);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/number/);
  });

  it('should require attribute "selectedLocations" when voting for a Location survey', async () => {
    survey = await createLocationSurvey(locations, meeting, 3);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);

    expect(res.body.message).toMatch(/selectedLocations/);
    expect(res.body.message).toMatch(/required/);
  });

  it('should require attribute "selectedLocations" to be an array when voting for a Location survey', async () => {
    body.selectedLocations = '';
    survey = await createLocationSurvey(locations, meeting, 3);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/selectedLocations/);
    expect(res.body.message).toMatch(/array/);
  });

  it('should require attribute "selectedLocations" to be an array of integer when voting for a Location survey', async () => {
    body.selectedLocations = [3, '2', 'st'];
    survey = await createLocationSurvey(locations, meeting, 3);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/number/);
  });

  it('should require attribute "selectedMeals" when voting for a Meal survey', async () => {
    survey = await createMealSurvey(meals, meeting, 2);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);

    expect(res.body.message).toMatch(/selectedMeals/);
    expect(res.body.message).toMatch(/required/);
  });

  it('should require attribute "selectedMeals" to be an array when voting for a Meal survey', async () => {
    body.selectedMeals = '';
    survey = await createMealSurvey(meals, meeting, 2);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/selectedMeals/);
    expect(res.body.message).toMatch(/array/);
  });

  it('should require attribute "selectedMeals" to be an array of integer when voting for a Meal survey', async () => {
    body.selectedMeals = [3, '2', 'st'];
    survey = await createMealSurvey(meals, meeting, 2);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/number/);
  });

  it('should require attribute "selectedDates" when voting for a Location and Date survey', async () => {
    delete body.selectedDates;
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);

    expect(res.body.message).toMatch(/selectedDates/);
    expect(res.body.message).toMatch(/required/);
  });

  it('should require attribute "selectedDates" to be an array when voting for a Location and Date survey', async () => {
    body.selectedDates = '';
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/selectedDates/);
    expect(res.body.message).toMatch(/array/);
  });

  it('should require attribute "selectedDates" to be an array of integer when voting for a Location and Date survey', async () => {
    body.selectedDates = [3, '2', 'st'];
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/number/);
  });

  it('should require attribute "selectedLocations" when voting for a Location and Date survey', async () => {
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);

    expect(res.body.message).toMatch(/selectedLocations/);
    expect(res.body.message).toMatch(/required/);
  });

  it('should require attribute "selectedLocations" to be an array when voting for a Location and Date survey', async () => {
    body.selectedLocations = '';
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/selectedLocations/);
    expect(res.body.message).toMatch(/array/);
  });

  it('should require attribute "selectedLocations" to be an array of integer when voting for a Location and Date survey', async () => {
    body.selectedLocations = [3, '2', 'st'];
    survey = await createLocationAndDateSurvey(dates, locations, meeting, 4);
    apiURL = `/api/surveys/${survey.id}/votes`;

    const res = await exec();

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/number/);
  });
});
