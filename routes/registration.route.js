const _ = require('lodash');
const router = require('express').Router();
const argon2 = require('argon2');
const { createSessionToken } = require('./../utils/security.util');
const { User } = require('./../models');

router['post']('/', async (req, res) => {
  const payload = req.body;
  await createUserAndSession(res, payload);
});

/**
 *
 * @param {{status, json, sendStatus}} res
 * @param {{email, password}} payload
 * @return {Promise<void>}
 */
async function createUserAndSession(res, payload) {
  const passwordDigest = await argon2.hash(payload.password);
  payload = Object.assign({}, payload, { password: passwordDigest });
  const user = await User.create(payload);
  const sessionToken = await createSessionToken(user);
  res['cookie']('SESSIONID', sessionToken, {
    httpOnly: true,
    secure: true
  });
  res.status(200).json(_.pick(user, ['id', 'name', 'email']));
}

module.exports = router;
