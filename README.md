# Backend Portfolio App Documentation

## Overview

This is a backend server for a portfolio app built with Node.js, Express, and MongoDB. It handles user authentication, comments, and user data management, with custom logging and error handling.

## Features

- **User Management:**

  - Authenticated
  - Signup
  - Login
  - Logout
  - Email verification
  - Forgot password
  - Reset password
  - Update user information

- **Comments CRUD:**

  - Get all comments
  - Create a comment
  - Update a comment
  - Delete a comment
  - Update/Delete by ID

- **Replies CRUD:**

  - Get all replies
  - Create a reply
  - Update a reply
  - Delete a reply
  - Update/Delete by ID
  - Get/Create by ID of comment

- **Custom Logger:**
  - Logs errors and user actions

## Tech Stack

- **Node.js**: Backend runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **Nodemailer**: For email services (e.g., email verification, password reset)
- **bcrypt**: For password hashing
- **jsonwebtoken**: For secure user authentication
- **dotenv**: To manage environment variables
- **multer**: For handling file uploads
- **sharp**: For image resizing
- **express-rate-limit**: For rate limiting
- **helmet**: Security headers
- **hpp**: Protect against HTTP parameter pollution
- **express-mongo-sanitize**: Prevent NoSQL injections
- **validator**: Input validation
- **cookie-parser**: Cookies
- **cors**: Cors

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Asuzaka/Portfolio-app.git
   cd portfolio-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in a `.env` file:

   ```env
   PORT=3000
   FRONTEND_URL=your_frontend_url
   DATABASE_PASSWORD=your_mongo_pass
   DATABASE=your_mongo_url
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRE=90
   MAIL_HOST=your_smtp_host
   MAIL_PORT=your_smtp_port
   MAIL_USER=your_smtp_user
   MAIL_PASS=your_smtp_pass
   MAIL_SECURE=boolean
   ```

## App Setup and Middleware

The server setup ensures security, data handling, and performance optimizations:

- **Security headers** using `helmet`.
- **Rate limiting** caps requests per IP to avoid abuse.
- **Cookies** parses cookies from request.
- **CORS** allow frontend origin.
- **Body parser** for parsing JSON payloads, limited to 10kb.
- **MongoDB sanitization** prevents NoSQL injection attacks.
- **Static file serving** for public assets.
- **Custom error handling** captures and manages all errors.

### Server Entry (`app.js`)

```javascript
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
```

## API Endpoints

### User Routes

- **GET** `/api/v1/users/authenticated`: User authentication
- **POST** `/api/v1/users/signup`: User signup
- **GET** `/api/v1/users/logout`: User lougout
- **POST** `/api/v1/users/login`: User login
- **GET** `/api/v1/users/verify/:token`: Verify user email
- **POST** `/api/v1/users/forgetPassword`: Send reset password email
- **POST** `/api/v1/users/resetPassword/:token`: Reset password

### Protected User Route

- **PATCH** `/api/v1/users/me`: Update user information (with image upload and resize)

### Comments Routes

- **GET** `/api/v1/comments`: Get all comments
- **POST** `/api/v1/comments`: Create a new comment
- **PATCH** `/api/v1/comments`: Update a comment
- **DELETE** `/api/v1/comments`: Delete a comment
- **PATCH** `/api/v1/comments/:id`: Update a comment by ID
- **DELETE** `/api/v1/comments/:id`: Delete a comment by ID

### Reply Routes

- **GET** `/api/v1/replies/:comment`: Get all reply by comment ID
- **POST** `/api/v1/replies/:comment`: Create a new reply by comment ID
- **PATCH** `/api/v1/replies/:id`: Update a reply by ID
- **DELETE** `/api/v1/replies/:id`: Delete a comment by ID

### Custom Logger

- Logs requests and errors to `logs/` directory
- Structured logging format

## Error Handling

- Centralized error handling middleware
- Returns consistent JSON error responses

## Rate Limiting

- Prevents abuse by limiting requests per IP
- Example: 500 requests per day

## Pagination

- Supports pagination for comments/replies
- Example: `/api/v1/comments?page=2&limit=10`
- Example: `/api/v1/replies/:comment?page=2&limit=10`

<!-- ## Testing

- **Jest** for unit testing
- **Supertest** for API endpoint testing -->

## Running the Server

```bash
npm start
```

## Dependencies

```json
{
  "bcrypt": "^5.1.1",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "express-mongo-sanitize": "^2.2.0",
  "express-rate-limit": "^7.5.0",
  "helmet": "^8.0.0",
  "hpp": "^0.2.3",
  "jsonwebtoken": "^9.0.2",
  "mongodb": "^6.14.2",
  "mongoose": "^8.12.1",
  "multer": "^1.4.5-lts.2",
  "nodemailer": "^6.10.0",
  "sharp": "^0.33.5",
  "validator": "^13.12.0"
}
```

## Future Improvements

- Role-based access control (admin/user permissions)
- WebSocket for real-time features
- Caching with Redis
- Docker setup for containerization
