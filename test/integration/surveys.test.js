const request = require('supertest');
const app = require('./../../app');
const Faker = require('faker');
const { createSessionToken } = require('../../utils/security.util');
const { sequelize, Survey, User, Meeting } = require('./../../models');

describe('Surveys', () => {
  let meeting;
  let sessionTokenString;
  let body;
  let user;

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

    body = {
      locations: [
        Faker.address.streetAddress(true),
        Faker.address.streetAddress(true),
        Faker.address.streetAddress(true)
      ]
    };
  });

  const exec = () =>
    request(app)
      .post(`/api/meetings/${meeting.id}/surveys`)
      .send(body)
      .set('Cookie', sessionTokenString);

  it('should create a survey user is authenticated', async () => {
    await meeting.setOwner(user);
    const res = await exec();

    expect(res.statusCode).toBe(200);

    const surveys = await Survey.findAll();
    expect(surveys.length).toBe(1);
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
});
