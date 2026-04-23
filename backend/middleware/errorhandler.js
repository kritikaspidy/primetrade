const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({ error: message });
};

const notFoundHandler = (req, res) => {
  return res.status(404).json({ error: 'Route not found' });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
