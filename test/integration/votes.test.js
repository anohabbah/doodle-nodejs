const request = require('supertest');
const app = require('./../../app');
const { sequelize, Meeting, User, Vote } = require('./../../models');
const { createDateSurvey } = require('./../../utils/survey.util');
const { createSessionToken } = require('./../../utils/security.util');
const Faker = require('faker');

// user should be authenticated
// user should be invited to the associated meeting to be able to vote
// survey should exist
// user choices should be associated to the given survey

describe('Votes', () => {
  let survey;
  let apiURL;
  const body = {
    selectedDates: [1, 3]
  };
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

  beforeEach(async () => {
    await sequelize.sync();

    meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.text()
    });
    user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });

    const sessionToken = await createSessionToken(user);
    sessionTokenString = `SESSIONID=${sessionToken}`;
  });

  const exec = () =>
    request(app)
      .post(apiURL)
      .send(body)
      .set('Cookie', sessionTokenString);

  it('should register user votes for Date survey', async () => {
    survey = await createDateSurvey(dates, meeting.id);
    apiURL = `/api/surveys/${survey.id}/votes`;

    // const res = await exec();
    //
    // await user.reload({ include: [{ model: Vote, as: 'votes' }] });
    // const map = user.get('votes').map(i => i.id);
    //
    // expect(res.statusCode).toBe(200);
    // expect(map).toEqual(expect.arrayContaining(body.selectedDates));
  });
});
