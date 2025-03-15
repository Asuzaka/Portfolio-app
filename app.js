const express = require("express");

const app = express();

// Body parser
app.use(express.json());

// Middlware
app.use((req, res, next) => {
  next();
});

module.exports = app;
