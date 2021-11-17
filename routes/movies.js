const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const {
  getMovie,
  postMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getMovie);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

router.post('/movies', postMovie);

module.exports = router;
