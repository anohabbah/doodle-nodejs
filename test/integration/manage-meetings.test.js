const request = require('supertest');
const Faker = require('faker');
const { parse } = require('./../../utils/app.util');
const { sequelize, Meeting, User } = require('./../../models');
const app = require('./../../app');
const { createSessionToken } = require('../../utils/security.util');

describe('Meetings', () => {
  let attributes;
  let url;
  const apiURL = '/api/meetings';
  let cookie;
  let meeting;
  let user;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    url = undefined;
    attributes = {
      title: Faker.lorem.sentence(),
      description: Faker.lorem.paragraph()
    };
    meeting = await Meeting.create(attributes);
    await meeting.reload();

    user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });
    const sessionToken = await createSessionToken(user);
    cookie = `SESSIONID=${sessionToken}`;
  });

  describe(`GET ${apiURL}`, () => {
    const exec = async () =>
      await request(app)
        .get(apiURL)
        .set('Cookie', cookie);

    it('unauthenticated user could not load meetings', async () => {
      cookie = '';
      const res = await exec();

      expect(res.statusCode).toBe(401);
    });

    it('should load meetings if user is authenticated', async () => {
      await meeting.setOwner(user);

      const res = await exec();

      expect(res.body).toEqual(expect.arrayContaining([parse(meeting)]));
    });

    it('should load auth user meetings only', async () => {
      const userMeeting = await Meeting.create(attributes);
      await userMeeting.setOwner(user);

      const res = await exec();
      expect(res.body).toEqual(expect.not.arrayContaining([parse(meeting)]));
      expect(res.body).toEqual(expect.arrayContaining([parse(userMeeting)]));
    });
  });

  describe(`POST ${apiURL}`, () => {
    const exec = async () =>
      await request(app)
        .post(apiURL)
        .set('Cookie', cookie)
        .send(attributes);

    it('should not create meeting if the user is not authenticated', async () => {
      cookie = '';
      const res = await exec();
      expect(res.statusCode).toBe(401);
    });

    it('should create a meeting if the user is authenticated', async () => {
      const res = await exec();

      expect(res.body).toEqual(expect.objectContaining(attributes));

      const meetings = await Meeting.findAll();
      expect(parse(meetings)).toEqual(expect.arrayContaining([res.body]));
      expect(res.body.ownerId).toBe(user.id);
    });

    it('should return an UnProcessable Entity Error if title & description are not provided', async () => {
      attributes = { title: null, description: null };
      const res = await exec();
      expect(res.statusCode).toBe(422);
    });

    it("should return an UnProcessable Entity Error if title isn't provided", async () => {
      attributes = { title: null, description: Faker.lorem.paragraph() };
      const res = await exec();
      expect(res.statusCode).toBe(422);
    });

    it("should return an UnProcessable Entity Error if description isn't provided", async () => {
      attributes = { title: Faker.lorem.sentence(), description: null };
      const res = await exec();
      expect(res.statusCode).toBe(422);
    });
  });

  describe(`GET ${apiURL}/:meetingId`, () => {
    const exec = async () =>
      await request(app)
        .get(url)
        .set('Cookie', cookie);

    it('should not retrieve meeting details if the user is not authenticated', async () => {
      cookie = '';
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(401);
    });

    it('should retrieve meeting details if the user is authenticated', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.body).toEqual(expect.objectContaining(parse(meeting)));
    });

    it('should return 404 Error if the given Id does not exist', async () => {
      url = `${apiURL}/3`;
      const res = await exec();
      expect(res.statusCode).toBe(404);
    });
  });

  describe(`PUT ${apiURL}/:projectId`, () => {
    let data;

    const exec = async () =>
      await request(app)
        .put(url)
        .send(data)
        .set('Cookie', cookie);

    it('should not update meeting details if the user is not authenticated', async () => {
      cookie = '';
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(401);
    });

    it('should update a meeting if the user is authenticated', async () => {
      url = `${apiURL}/${meeting.id}`;
      data = {
        title: Faker.lorem.sentence(),
        description: Faker.lorem.paragraph()
      };

      await meeting.setOwner(user);

      const res = await exec();

      expect(res.body).toEqual(expect.objectContaining(data));
    });

    it('should update a meeting, only and only if the authenticated user is the owner', async () => {
      url = `${apiURL}/${meeting.id}`;

      let res = await exec();

      expect(res.statusCode).toBe(403);

      data = {
        title: Faker.lorem.sentence(),
        description: Faker.lorem.paragraph()
      };
      await meeting.setOwner(user);

      res = await exec();

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(expect.objectContaining(data));
    });

    it('should throw if trying to update a meeting that does not exist', async () => {
      url = `${apiURL}/3`;

      const res = await exec();

      expect(res.statusCode).toBe(404);
    });

    it('should return an UnProcessable Entity Error if title & description are not provided', async () => {
      url = `${apiURL}/${meeting.id}`;
      data = { title: null, description: null };

      await meeting.setOwner(user);

      const res = await exec();

      expect(res.statusCode).toBe(422);
    });

    it("should return an UnProcessable Entity Error if title isn't provided", async () => {
      url = `${apiURL}/${meeting.id}`;
      data = { title: null, description: 'Beautiful description' };

      await meeting.setOwner(user);

      const res = await exec();

      expect(res.statusCode).toBe(422);
    });

    it("should return an UnProcessable Entity Error if description isn't provided", async () => {
      url = `${apiURL}/${meeting.id}`;
      data = { title: 'Beautiful title', description: null };

      await meeting.setOwner(user);

      const res = await exec();

      expect(res.statusCode).toBe(422);
    });
  });

  describe(`DELETE ${apiURL}/:projectId`, () => {
    const exec = async () =>
      request(app)
        .delete(url)
        .set('Cookie', cookie);

    it('should delete a meeting if the user is not authenticated', async () => {
      cookie = '';
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(401);
    });

    it('should delete a meeting if the user is authenticated', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();

      const meetings = await Meeting.findAll();
      expect(res.body).toEqual(expect.objectContaining(parse(meeting)));
      expect(parse(meetings)).toEqual(expect.not.arrayContaining([res.body]));
    });

    it('should return 404 Error if the given Id does not exist', async () => {
      url = `${apiURL}/3`;
      const res = await exec();
      expect(res.statusCode).toBe(404);
    });
  });
});
