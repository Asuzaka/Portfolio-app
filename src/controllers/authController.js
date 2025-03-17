const customError = require("../services/customError");
const User = require("./../models/userModel");
const catchAsync = require("./../services/catchAsync");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("./../services/nodemailer");
const validator = require("validator");
const { promisify } = require("util");

exports.protect = catchAsync(async (req, res, next) => {
  let token = "";
  // Getting token
  if (
    !(
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
  ) {
    return next(
      new customError("You are not logged in. Please log in to get acces", 401)
    );
  }
  token = req.headers.authorization.split(" ")[1];
  // Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Check if user still exist
  const user = User.findById(decoded.id);
  if (!user) {
    return next(
      new customError("The user belonging to this token no longer exists", 401)
    );
  }
  // Check is user changed password after the token was issued

  // Acces to protected route
  req.user = user;
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  // Creating user
  await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // Getting user
  const user = await User.findOne({ email: req.body.email });
  // Creating verify token for user
  const userToken = user.createUserToken();
  await user.save({ validateBeforeSave: false });
  //  Send back an email
  const verfiyUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify/${userToken}`;
  const message = `Your email ${user.email} have been registered on site ${req.protocol}. To confirm your email visit ${verfiyUrl}. If you don't, ignore this message`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your verify link is valid for 24 hours",
      message,
    });

    res.status(200).json({
      status: "succes",
      message: "Verify link sent to email",
    });
  } catch (error) {
    // Immidetely delete user not to cause problems
    await user.deleteOne();
    return next(
      new customError("There was an error sending email. Try again later", 500)
    );
  }
});

exports.verify = catchAsync(async (req, res, next) => {
  // Getting token from params
  const { token } = req.params;
  // hashing token
  const userToken = crypto.createHash("sha256").update(token).digest("hex");
  // Finding user by comparing hashed token
  const user = await User.findOne({ userToken });
  if (!user) {
    return next(new customError("Invalid link or expired", 400));
  }
  user.isVerified = true;
  user.userToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Sending response
  createTokenAndSend(user, res, {
    statusCode: 200,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { uni, password } = req.body;
  const email = validator.isEmail(uni);
  let user;
  // Check if input is email or username
  if (email) {
    user = await User.findOne({ email: uni }).select("+password");
  } else {
    user = await User.findOne({ username: uni }).select("+password");
  }
  // Check passwords
  if (!user || !(await user.confirmPassword(password, user.password))) {
    return next(
      new customError(
        `${email ? "email" : "username"} or password is incorrect`,
        401
      )
    );
  }
  // Check if user has verified email
  if (!user.isVerified) {
    return next(new customError("You are not verified email", 401));
  }
  // Send response
  createTokenAndSend(user, res, { statusCode: 200 });
});

exports.accesTo = (...roles) => {
  return (req, res, next) => {
    // Checking if user has permission
    const permission = roles.includes(req.user.role);
    if (!permission) {
      return next(
        new customError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    // If so, continue
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get token from params
  let token = req.params.token;
  // Encode token
  token = crypto.createHash("sha256").update(token).digest("hex");
  // Find user by Encoded token
  const user = await User.findOne({
    passwordToken: token,
    passwordTokenExpire: { $gte: Date.now() },
  });
  if (!user) {
    return next(new customError("Token expired or invalid", 400));
  }

  // Get pass/confirm from body
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordToken = undefined;
  user.passwordTokenExpire = undefined;
  // Change doc
  await user.save();

  createTokenAndSend(user, res, { statusCode: 200 });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get an email from body
  const { email } = req.body;
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new customError("No user with this email", 400));
  }
  // Create token
  const resetToken = user.createResetToken();
  await user.save();
  // Send Mail
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You have requested for password reset link ${resetUrl} . If you don't just ignore this message`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your reset link is valid for 15 minutes",
      message,
    });

    res.status(200).json({
      status: "succes",
      message: "Reset link sent to email",
    });
  } catch (error) {
    return next(
      new customError("There was an error sending email. Try again later", 500)
    );
  }
});

function createTokenAndSend(user, res, options) {
  // Creating jwt Token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };

  // Sending cookies
  res.cookie("jwt", token, cookieOptions);
  res.status(options.statusCode).json({ status: "succes", token });
}
