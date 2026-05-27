const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Server Error] ${err.stack || err.message}`);

  // Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: `Resource not found with ID of ${err.value}` });
  }

  // Mongoose Duplicate Key (Unique Constraint)
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered. Record already exists.' });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error occurred on telemetry backend'
  });
};

export default errorHandler;
