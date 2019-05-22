const { createLogger, transports, format } = require('winston');

const configTransports =
  process.env.NODE_ENV === 'development'
    ? [new transports.Console({ format: format['prettyPrint']() })]
    : [new transports.File({ filename: 'error.log' })];

const logger = createLogger({ transports: configTransports });

module.exports = (err, req, res, next) => {
  logger.error(err.message, err);
  res.sendStatus(err.statusCode);
};
