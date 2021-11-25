const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  login,
} = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }),
}), login);

module.exports = router;
