const _ = require('lodash');
const faker = require('faker');
const request = require('supertest');
const app = require('./../../app');
const { sequelize } = require('./../../models');

describe('Registration', () => {
  const apiURL = '/api/register';
  faker.locale = 'fr';

  beforeEach(() => {
    sequelize.sync({ force: true });
  });

  it('should register a user', async () => {
    const attributes = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const res = await request(app)
      .post(apiURL)
      .send(attributes);

    expect(res.body).toEqual(
      expect.objectContaining(_.pick(attributes, ['email', 'name']))
    );
  });
});
