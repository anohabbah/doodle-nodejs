const { createUnauthorizedError } = require('../utils/create-error.util');

exports.authMiddleware = (req, res, next) => {
  if (req['user']) next();
  else next(createUnauthorizedError());
};
