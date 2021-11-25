const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'С вашего IP сделано слишком много запросов. Повторите попытку через час.',
});

module.exports = apiLimiter;
