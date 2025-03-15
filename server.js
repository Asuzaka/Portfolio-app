const Logger = require("./src/services/SaveLogs");
process.on("unhandledRejection", (error) => {
  Logger(error, server, __dirname);
});

// Logs for any unhanledRejections

const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/.env.local` });

const mongodbURL = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(mongodbURL).then((msg) => {
  console.log("Succesfully connected to a Database.");
});

const app = require("./app");

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running...`);
});
