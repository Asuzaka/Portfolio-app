const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const UserScheme = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "A user must have a username"],
    validate: [validator.isAlpha, "A username must contain only characters"],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "A user must have a name"],
    trim: true,
  },
  role: {
    type: String,
    enum: ["owner", "company", "user"],
    default: "user",
    select: false,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "A user must have an email"],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "A user must have a valid email"],
  },
  description: String,
  password: {
    type: String,
    required: [true, "A user must have a password"],
    trim: true,
    select: false,
    minlength: 8,
    validate: [
      validator.isAlphanumeric,
      "A password must contain only characters",
    ],
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "password doesn't match",
    },
  },
  userToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  passwordToken: String,
  passwordTokenExpire: Date,
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Automatic encoding password as soon as recieved
UserScheme.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserScheme.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// To Remove unverified users from db
UserScheme.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400, // 24 hours
    partialFilterExpression: { isVerified: false },
  } // Only applies to unverified users
);

// To Remove Deleted users from db
UserScheme.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// To create User Token
UserScheme.methods.createUserToken = function () {
  const userToken = crypto.randomBytes(26).toString("hex");

  this.userToken = crypto.createHash("sha256").update(userToken).digest("hex");

  return userToken;
};

UserScheme.methods.confirmPassword = async function (candidate, password) {
  return await bcrypt.compare(candidate, password);
};

UserScheme.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

UserScheme.methods.confirmResetToken = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    this.passwordChangedAt / 1000;
    console.log(this.passwordChangedAt);
  }
};

const User = mongoose.model("User", UserScheme);

module.exports = User;
