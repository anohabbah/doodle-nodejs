const router = require('express').Router();
const argon2 = require('argon2');
const _ = require('lodash');
const {
  createUnprocessableEntityError
} = require('../utils/create-error.util');

const { createSessionToken } = require('../utils/security.util');
const { User } = require('./../models');

/**
 *
 * @param {{email, password}} credentials
 * @param {{email, password}} user
 * @param {{cookie, status}} res
 * @return {Promise<void>}
 */
async function loginAndBuildResponse(credentials, user, res) {
  try {
    const sessionToken = await attemptLogin(credentials, user, res);

    res.cookie('SESSIONID', sessionToken, { httpOnly: true, secure: true });

    res.status(200).json(_.pick(user, ['id', 'name', 'email']));
  } catch (e) {
    res.status(422).json('Email or Password invalid.');
  }
}

/**
 *
 * @param {{email, password}} credentials
 * @param {{email, password}} user
 * @param {{status}} res
 * @return {Promise<void>}
 */
async function attemptLogin(credentials, user, res) {
  const verified = await argon2.verify(user.password, credentials.password);

  if (!verified)
    throw createUnprocessableEntityError('Email or Password invalid.');

  return await createSessionToken(user);
}

router['post']('/', async (req, res) => {
  const credentials = req.body;

  const user = await User.findOne({ where: { email: credentials.email } });
  if (!user) return res.status(422).json('Email or Password invalid.');

  await loginAndBuildResponse(credentials, user, res);
});

module.exports = router;
