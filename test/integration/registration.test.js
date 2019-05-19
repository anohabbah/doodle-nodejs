const _ = require('lodash');
const faker = require('faker');
const request = require('supertest');
const app = require('./../../app');
const { sequelize } = require('./../../models');

describe('Registration', () => {
  const apiURL = '/api/register';
  faker.locale = 'fr';
  let attributes;

  beforeEach(() => {
    sequelize.sync({ force: true });

    attributes = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: 'M1Ryl9n5'
    };
  });

  const exec = async () =>
    await request(app)
      .post(apiURL)
      .send(attributes);

  it('should register a user', async () => {
    const res = await exec();

    expect(res.body).toEqual(
      expect.objectContaining(_.pick(attributes, ['email', 'name']))
    );
  });

  it('user name is required', async () => {
    attributes.name = '';

    const res = await exec();

    expect(res.statusCode).toBe(422);
  });

  it('user email is required', async () => {
    attributes.email = '';

    const res = await exec();

    expect(res.statusCode).toBe(422);
  });

  it('user password is required', async () => {
    attributes.password = '';

    const res = await exec();

    expect(res.statusCode).toBe(422);
  });
});
