const express = require("express");
const customError = require("./src/services/customError");
const errorController = require("./src/controllers/errorController");
const userRoute = require("./src/routes/userRoute");

const app = express();

// Body parser
app.use(express.json());

// Middlware
app.use((req, res, next) => {
  next();
});

app.use("/api/v1/users", userRoute);

// Not found Route Error handling
app.use("*", (req, res, next) => {
  next(new customError(`Can't reach ${req.originalUrl} on this server`, 404));
});

// For any other errors
app.use(errorController);

module.exports = app;
