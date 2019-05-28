const request = require('supertest');
const app = require('./../../app');
const Faker = require('faker');
const _ = require('lodash');
const { createSessionToken } = require('../../utils/security.util');
const { parse } = require('../../utils/app.util');
const { sequelize, User, Meeting } = require('./../../models');

describe('Invitation Test', () => {
  let meeting;
  let user;
  let sessionTokenString;
  let body = [];

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create(userAttrFactory());
    meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.paragraph()
    });

    apiURL = `/api/meetings/${meeting.id}/invitations`;

    const sessionToken = await createSessionToken(user);
    sessionTokenString = `SESSIONID=${sessionToken}`;
  });

  const userAttrFactory = () => {
    return {
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    };
  };

  let apiURL;
  const exec = () =>
    request(app)
      .post(apiURL)
      .send({ participants: body })
      .set('Cookie', sessionTokenString);

  it('should not invite participants if user is not authenticated', async () => {
    sessionTokenString = '';
    const res = await exec();
    expect(res.statusCode).toBe(401);
  });

  it('should invite participants only if user is authenticated', async () => {
    await meeting.setOwner(user);
    const user1 = await User.create(userAttrFactory());
    const user2 = await User.create(userAttrFactory());
    body = [user2.email, user1.email];

    const res = await exec();

    const participants = res.body.participants.map(p =>
      _.omit(p, 'meeting_participants')
    );
    expect(participants.length).toBe(2);
    expect(participants).toEqual(expect.arrayContaining([parse(user1)]));
    expect(participants).toEqual(expect.arrayContaining([parse(user2)]));
  });

  it('should throw if the target meeting does not exist', async () => {
    apiURL = `/api/meetings/6/invitations`;
    const res = await exec();
    expect(res.statusCode).toBe(404);
  });

  it('should throw if the authenticated user is not the meeting owner', async () => {
    const res = await exec();
    expect(res.statusCode).toBe(403);
  });

  it('should throw if meeting owner try to invite itself', async () => {
    await meeting.setOwner(user);
    body.push(user.email);

    const res = await exec();

    expect(res.statusCode).toBe(403);
  });
});
