// Modules
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Local
const replyRoute = require("./src/routes/replyRoute");
const userRoute = require("./src/routes/userRoute");
const commentRoute = require("./src/routes/commentRoute");
const customError = require("./src/services/customError");
const errorController = require("./src/controllers/errorController");

const app = express();

// Read Cookies
app.use(cookieParser());

// CORS FOR FRONTEND
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`, // Allow frontend Origin
    credentials: true, // Allow cookies and authentification headers
  })
);

// set Security HTTP HEADERS
app.use(helmet());

app.set("trust proxy", 1);

// Limit requests From IP
const limier = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limier);

// Body parser, reading data from body to  req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL injection
app.use(sanitize());

// Body parser
app.use(express.json());

// Middlware
app.use((req, res, next) => {
  next();
});

app.use(
  "/public",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Important for images
    next();
  },
  express.static(path.join(__dirname, "public"))
);

app.use("/api/v1/users", userRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/replies", replyRoute);

// Handle 404 erros
app.use("*", (req, res, next) => {
  next(new customError(`Can't reach ${req.originalUrl} on this server`, 404));
});

// Central error handling
app.use(errorController);

module.exports = app;
