require('express-async-errors');
const { createError } = require('./utils/create-error.util');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { exceptions, transports, format } = require('winston');

const transport =
  process.env.NODE_ENV !== 'production'
    ? new transports.Console({ format: format['prettyPrint']() })
    : new transports.File({ filename: 'uncaught-exception.log' });
exceptions.handle(transport);
process.on('unhandledRejection', ex => {
  throw ex;
});

const errorMiddleware = require('./middlewares/error.middleware');

const meetingRouter = require('./routes/meetings.route');
const registrationRouter = require('./routes/registration.route');

const app = express();

if (process.env.NODE_ENV !== 'production') app.use(logger('dev'));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/api/meetings', meetingRouter);
app.use('/api/register', registrationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorMiddleware);

module.exports = app;
