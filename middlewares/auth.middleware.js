const { createError } = require('../utils/create-error.util');
const { decodeJWT } = require('../utils/security.util');
const { createUnauthorizedError } = require('../utils/create-error.util');

/**
 *
 * @param {String} cookie
 * @param {any} req
 * @return {Promise<void>}
 */
async function handleSessionCookie(cookie, req) {
  try {
    const payload = await decodeJWT(cookie);
    req['user'] = payload.sub;
  } catch (e) {
    throw createError(500, e);
  }
}

exports.authMiddleware = (req, res, next) => {
  if (req['user']) next();
  else next(createUnauthorizedError());
};

exports.handleCookies = (req, res, next) => {
  const cookie = req.cookies['SESSIONID'];
  if (!cookie) return next();

  handleSessionCookie(cookie, req)
    .then(() => next())
    .catch(next);
};
