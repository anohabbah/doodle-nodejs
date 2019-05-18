const createError = require('http-errors');

/**
 * Create Error Generic
 * @param {string} name
 * @param {string} message
 * @return {HttpError}
 */
function fn(name, message) {
  return new createError[name](message);
}

exports.createError = createError;
exports.createBadRequestError = (message = '') => fn('BadRequest', message);
exports.createUnauthorizedError = (message = '') => fn('Unauthorized', message);
exports.createNotFoundError = (message = '') => fn('NotFound', message);
exports.createForbiddenError = (message = '') => fn('Forbidden', message);
exports.createUnprocessableEntityError = (message = '') =>
  fn('UnprocessableEntity', message);
