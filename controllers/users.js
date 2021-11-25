const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const AuthenticationFailedError = require('../errors/AuthenticationFailedError');
const ConflictError = require('../errors/ConflictError');
const {
  SOLT_ROUND,
  JWT_NOT_SECRET,
} = require('../configs/index');

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (user) {
      return res.send(user);
    }
    throw new NotFoundError('Пользователь с указанным _id не найден.');
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Передан невалидный _id'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      throw new NotFoundError('Пользователь с указанным _id не найден.');
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Передан невалидные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
  } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      throw new ConflictError('Пользователь с данным email уже зарегистрирован');
    }
    bcrypt.hash(req.body.password, SOLT_ROUND).then((hash) => User.create({
      name, email, password: hash,
    })
      .then(() => res.send({ message: 'Вы успешно зарегистрировались' }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Передан невалидные данные'));
        } else {
          next(err);
        }
      }));
  })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Передан невалидные данные');
  }
  User.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      throw new AuthenticationFailedError('Неправильные почта или пароль');
    }
    return bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        throw new AuthenticationFailedError('Неправильные почта или пароль');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : JWT_NOT_SECRET, { expiresIn: '7d' });
      res.send({ token });
    })
      .catch((err) => {
        next(err);
      });
  })
    .catch(next);
};
