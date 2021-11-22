require('dotenv').config();

const {
  DB_CONNECTION_STRING,
  NODE_ENV,
} = process.env;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const helmet = require('helmet');
const apiLimiter = require('./configs/limiter');
const {
  createUser,
  login,
} = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const auth = require('./middlewares/auth');
const handlerError = require('./middlewares/handlerError');
const {
  requestLogger,
  errorLogger,
} = require('./middlewares/logger');
const { DB_LOCAL_CONNECTION_STRING } = require('./configs/index');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(NODE_ENV === 'production' ? DB_CONNECTION_STRING : DB_LOCAL_CONNECTION_STRING, {
  useNewUrlParser: true,
});

app.use(requestLogger);

app.use(helmet());
app.use(apiLimiter);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(/^[a-zA-Z0-9]{3,30}$/),
  }),
}), createUser);

app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/movies'));

app.use(() => {
  throw new NotFoundError('Страница не найдена');
});

app.use(errorLogger);

app.use(errors());

app.use(handlerError);

app.listen(PORT);
