const customError = require("../services/customError");
const User = require("./../models/userModel");
const catchAsync = require("./../services/catchAsync");

exports.login = catchAsync(async (req, res, next) => {});

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  res.status(200).json({ status: "succes", data: { data: "empty" } });
});

exports.protect = catchAsync(async (req, res, next) => {});

exports.accesTo = (...roles) => {
  return (req, res, next) => {
    const permission = roles.includes(req.user.role);
    if (!permission) {
      next(
        new customError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};
