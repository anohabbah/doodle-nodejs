const argon2 = require('argon2');
const faker = require('faker');
const request = require('supertest');

const app = require('./../../app');
const { parse } = require('./../../utils/app.util');
const { sequelize, User } = require('./../../models');

describe('Login', () => {
  let credentials;
  let user;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    credentials = {
      email: faker.internet.email(),
      password: 'M1Ryl9n5'
    };

    const attributes = Object.assign({}, credentials, {
      password: await argon2.hash(credentials.password),
      name: faker.name.findName()
    });
    user = await User.create(attributes);
    await user.reload();
  });

  const exec = async () =>
    await request(app)
      .post('/api/login')
      .send(credentials);

  it('should login a user', async () => {
    const res = await exec();

    expect(parse(user)).toEqual(expect.objectContaining(res.body));
  });

  it("should return 422 if the email doesn't exist", async () => {
    credentials.email = 'test@test.com';
    const res = await exec();

    expect(res.statusCode).toBe(422);
  });

  it(`should return 422 if the password is incorrect`, async () => {
    credentials.password = '122676T8';
    const res = await exec();

    expect(res.statusCode).toBe(422);
  });
});
