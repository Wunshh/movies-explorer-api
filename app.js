require('dotenv').config();

const {
  DB_CONNECTION_STRING,
  NODE_ENV,
} = process.env;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const helmet = require('helmet');
const apiLimiter = require('./configs/limiter');
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

app.use(require('./routes/signup'));
app.use(require('./routes/signin'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.use(() => {
  throw new NotFoundError('Страница не найдена');
});

app.use(errorLogger);

app.use(errors());

app.use(handlerError);

app.listen(PORT);
