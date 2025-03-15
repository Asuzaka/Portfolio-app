const express = require("express");

const app = express();

// Body parser
app.use(express.json());

// Middlware
app.use((req, res, next) => {
  next();
});

app.use("/api/v1/users");

module.exports = app;
