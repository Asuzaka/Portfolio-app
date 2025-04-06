const customError = require("./../services/customError");

module.exports = (err, req, res, next) => {
  // Assign error status if it doesn't exist
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  // Get all from error
  let error = { ...err };
  error.message = err.message;

  // Take care of Operational errors
  if (error.name == "CastError") {
    error = handleCastErrorDB(error);
  }
  if (error.code == 11000) {
    error = handleDuplicateErrorDB(error);
  }
  if (error.name == "ValidationError") {
    error = handleValidationErrorDB(error);
  }
  if (error.name == "JsonWebTokenError") {
    error = handleJWTError();
  }
  if (error.name == "TokenExpiredError") {
    error = handleJWTexpired();
  }
  // Warn the developer by loggin the unexpected error to the console
  if (!error.isOperational) {
    console.log("Unexpected Error:", error);
  }
  // Sending the error response
  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });
};

function handleJWTexpired() {
  return new customError("Your token is expired, Please log in again", 401);
}
function handleJWTError() {
  return new customError("Invalid token. Please try again!", 401);
}
function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new customError(message, 400);
}
function handleCastErrorDB(err) {
  return new customError(`Invalid ${err.path}: ${err.value}`, 400);
}
function handleDuplicateErrorDB(err) {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new customError(
    `Duplicate ${field}: ${value}. Please use another value!`,
    400
  );
}
