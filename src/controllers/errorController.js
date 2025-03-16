const customError = require("./../services/customError");

module.exports = (err, req, res, next) => {
  // Assign error status if it doesn't exist
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  // Get all from error
  let error = JSON.parse(JSON.stringify(err));

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
  if (error.isOperational) {
    console.log("Unexpected Error:", error);
  }
  // Check before if error.message exists
  error.message = err.message || "Something went wrong...";
  // Sending the error response
  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });
};

function handleJWTexpired() {
  new customError("Your token is expired, Please log in again", 401);
}
function handleJWTError() {
  new customError("Invalid token. Please try again!", 401);
}
function handleValidationErrorDB(error) {
  console.log(error);
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  new customError(message, 400);
}
function handleCastErrorDB(err) {
  new customError(`Invalid ${err.path}: ${err.value}`, 400);
}
function handleDuplicateErrorDB(err) {
  new customError(
    `Duplicate field value: ${err.keyValue.name}. Please use another value!`,
    400
  );
}
