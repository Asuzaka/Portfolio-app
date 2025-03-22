const express = require("express");
const customError = require("./src/services/customError");
const errorController = require("./src/controllers/errorController");
const path = require("path");
const userRoute = require("./src/routes/userRoute");
const commentRoute = require("./src/routes/commentRoute");

const app = express();

// Body parser

app.use(express.json());

// Middlware
app.use((req, res, next) => {
  next();
});

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", userRoute);
app.use("/api/v1/comments", commentRoute);
// Not found Route Error handling
app.use("*", (req, res, next) => {
  next(new customError(`Can't reach ${req.originalUrl} on this server`, 404));
});

// For any other errors
app.use(errorController);

module.exports = app;
