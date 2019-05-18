const request = require('supertest');
const app = require('./../../app');

describe('Not Found', () => {
  it('should throw a 404 Error', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(404);
  });
});
