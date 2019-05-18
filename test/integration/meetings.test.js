const request = require('supertest');
const faker = require('faker');
// const _ = require('lodash');
const { parse } = require('./../../utils/app.util');
const { sequelize, Meeting } = require('./../../models');
const app = require('./../../app');

let meeting;

describe('Meetings', () => {
  let attributes;
  let url;
  const apiURL = '/api/meetings';

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    url = undefined;
    attributes = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    };
    meeting = await Meeting.create(attributes);
    await meeting.reload();
  });

  describe(`GET ${apiURL}`, () => {
    const exec = async () => await request(app).get(apiURL);

    it('should respond 200', async () => {
      const res = await exec();
      expect(res.statusCode).toBe(200);
    });

    it('should return meeting list available from DB', async () => {
      const res = await exec();
      expect(res.body).toEqual(expect.arrayContaining([parse(meeting)]));
    });
  });

  describe(`POST ${apiURL}`, () => {
    const exec = async () =>
      await request(app)
        .post(apiURL)
        .send(attributes);

    it('should respond 201', async () => {
      const res = await exec();
      expect(res.statusCode).toBe(201);
    });

    it('should create a meeting', async () => {
      const res = await exec();

      expect(res.body).toEqual(expect.objectContaining(attributes));

      const meetings = await Meeting.findAll();
      expect(parse(meetings)).toEqual(expect.arrayContaining([res.body]));
    });
  });

  describe(`GET ${apiURL}/:meetingId`, () => {
    const exec = async () => await request(app).get(url);

    it('should respond 200', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(200);
    });

    it('should retrieve meeting details', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.body).toEqual(expect.objectContaining(parse(meeting)));
    });
  });

  describe(`PUT ${apiURL}/:projectId`, () => {
    let data;

    const exec = async () =>
      await request(app)
        .put(url)
        .send(data);

    it('should respond 200', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(200);
    });

    it('should update a meeting', async () => {
      url = `${apiURL}/${meeting.id}`;
      data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph()
      };

      const res = await exec();

      expect(res.body).toEqual(expect.objectContaining(data));
    });
  });

  describe(`DELETE ${apiURL}/:projectId`, () => {
    const exec = async () => request(app).delete(url);

    it('should respond 200', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();
      expect(res.statusCode).toBe(200);
    });

    it('should delete a meeting', async () => {
      url = `${apiURL}/${meeting.id}`;
      const res = await exec();

      const meetings = await Meeting.findAll();
      expect(res.body).toEqual(expect.objectContaining(parse(meeting)));
      expect(parse(meetings)).toEqual(expect.not.arrayContaining([res.body]));
    });
  });
});
