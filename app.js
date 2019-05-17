require('express-async-errors');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
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

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

if (process.env.NODE_ENV !== 'production') app.use(logger('dev'));

app.use(helmet());
app.use(express.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorMiddleware);

module.exports = app;
