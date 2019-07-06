require('express-async-errors');
const { createError } = require('./utils/create-error.util');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { exceptions, transports, format } = require('winston');

// Initialize db
const db = require(__dirname + '/models');

const transport =
  process.env.NODE_ENV !== 'production'
    ? new transports.Console({ format: format['prettyPrint']() })
    : new transports.File({ filename: 'uncaught-exception.log' });
exceptions.handle(transport);
process.on('unhandledRejection', ex => {
  throw ex;
});

const errorMiddleware = require('./middlewares/error.middleware');

const meetingRouter = require('./routes/meetings.route')(db);
const registrationRouter = require('./routes/registration.route')(db);
const loginRouter = require('./routes/login.route')(db);
const logoutRouter = require('./routes/logout.route');
const surveyRouter = require('./routes/surveys.route')(db);
const userRouter = require('./routes/user.route')(db);
const { handleCookies } = require('./middlewares/auth.middleware');

const app = express();

if (process.env.NODE_ENV !== 'production') app.use(logger('dev'));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(handleCookies);

app.use('/api/meetings', meetingRouter);
app.use('/api/register', registrationRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/surveys', surveyRouter);
app.use('/api/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorMiddleware);

module.exports = app;
