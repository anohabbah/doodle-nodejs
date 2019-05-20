const request = require('supertest');
const app = require('./../../app');
const { createSessionToken } = require('../../utils/security.util');
const { User, sequelize } = require('./../../models');

describe('Logout', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('should logout', async () => {
    const user = await User.create({
      name: 'Abbah',
      email: 'test@test.test',
      password: 'IFUOSbciebfhybi17T3'
    });
    const sessionToken = await createSessionToken(user);
    await request
      .agent(app)
      .post('/api/logout')
      .set('Cookie', `SESSIONID=${sessionToken}`)
      .expect(
        'set-cookie',
        'SESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      );
  });

  it('should be authenticate to logout', async () => {
    const res = await request(app).post('/api/logout');

    expect(res.statusCode).toBe(401);
  });
});
