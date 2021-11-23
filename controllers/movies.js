const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovie = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send(movie))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const ownerId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: ownerId,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы невалидные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => next(new NotFoundError('Фильм с указанным _id не найден')))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        next(new ForbiddenError('Попытка удалить чужой фильм'));
      } else {
        Movie.deleteOne(movie)
          .then(() => res.send(movie))
          .catch(next);
      }
    })
    .catch(next);
};
