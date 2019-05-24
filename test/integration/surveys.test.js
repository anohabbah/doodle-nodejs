const request = require('supertest');
const app = require('./../../app');
const Faker = require('faker');
const { parse } = require('../../utils/app.util');
const { createSessionToken } = require('../../utils/security.util');
const { SURVEY_TYPE } = require('../../utils/constants.util');
const {
  sequelize,
  Survey,
  User,
  Meal,
  Meeting,
  Date,
  Location
} = require('./../../models');

describe('Surveys', () => {
  let meeting;
  let sessionTokenString;
  let body;
  let user;
  let apiURL;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });

    const sessionToken = await createSessionToken(user);
    sessionTokenString = `SESSIONID=${sessionToken}`;

    meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.text()
    });

    apiURL = `/api/meetings/${meeting.id}/surveys`;

    body = {
      surveyType: SURVEY_TYPE.DateSurvey,
      locations: [
        Faker.address.streetAddress(true),
        Faker.address.streetAddress(true),
        Faker.address.streetAddress(true)
      ],
      dates: [
        Faker.date.future(),
        Faker.date.future(),
        Faker.date.future(),
        Faker.date.future()
      ]
    };
  });

  const exec = () =>
    request(app)
      .post(apiURL)
      .send(body)
      .set('Cookie', sessionTokenString);

  it('should create a Date survey', async () => {
    await meeting.setOwner(user);
    const res = await exec();

    const surveys = await Survey.findAll();
    const dates = await Date.findAll();
    expect(surveys.length).toBe(1);
    expect(dates.length).toBeGreaterThanOrEqual(4);
    const map = res.body.dates.map(i => i.timestamp);
    expect(map).toEqual(expect.arrayContaining(parse(body.dates)));
  });

  it('should create a Location survey', async () => {
    await meeting.setOwner(user);

    body.surveyType = SURVEY_TYPE.LocationSurvey;

    const res = await exec();

    const surveys = await Survey.findAll();
    const locations = await Location.findAll();
    expect(surveys.length).toBe(1);
    expect(locations.length).toBeGreaterThanOrEqual(3);
    const map = res.body.locations.map(i => i.address);
    expect(map).toEqual(expect.arrayContaining(parse(body.locations)));
  });

  it('should create Date and Location survey', async () => {
    await meeting.setOwner(user);

    body.surveyType = SURVEY_TYPE.LocationAndDateSurvey;

    const res = await exec();

    const surveys = await Survey.findAll();
    const locations = await Location.findAll();
    const dates = await Date.findAll();
    expect(surveys.length).toBe(1);
    expect(dates.length).toBeGreaterThanOrEqual(4);
    expect(locations.length).toBeGreaterThanOrEqual(3);
    const map = res.body.locations.map(i => i.address);
    expect(map).toEqual(expect.arrayContaining(parse(body.locations)));
    const map2 = res.body.dates.map(i => i.timestamp);
    expect(map2).toEqual(expect.arrayContaining(parse(body.dates)));
  });

  it('should create a Meal survey', async () => {
    delete body.dates;
    delete body.locations;

    body['meals'] = [
      Faker.lorem.words(),
      Faker.lorem.words(),
      Faker.lorem.words()
    ];

    await meeting.setOwner(user);

    body.surveyType = SURVEY_TYPE.MealSurvey;

    const res = await exec();

    const surveys = await Survey.findAll();
    const meals = await Meal.findAll();
    expect(surveys.length).toBe(1);
    expect(meals.length).toBeGreaterThanOrEqual(3);
    const map2 = res.body.meals.map(i => i.name);
    expect(map2).toEqual(expect.arrayContaining(parse(body.meals)));
  });

  it('should throw if user is not authenticated', async () => {
    sessionTokenString = '';
    const res = await exec();
    expect(res.statusCode).toBe(401);
  });

  it('should throw if auth user is not the meeting owner', async () => {
    const res = await exec();
    expect(res.statusCode).toBe(403);
  });

  it('should throw if the given meeting does not exist', async () => {
    apiURL = `/api/meetings/60/surveys`;
    const res = await exec();
    expect(res.statusCode).toBe(404);
  });
});
