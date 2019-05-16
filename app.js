const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const errorMiddleware = require('./middlewares/error.middleware');

require('express-async-errors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(helmet());
app.use(logger('dev'));
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
