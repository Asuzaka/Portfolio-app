const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    trim: true,
    select: false,
    minlength: 8,
    validate: [validator.isAlpha, "A password must contain only characters"],
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
  userActivated: {
    type: Boolean,
    default: false,
  },
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
  if (this.password.isModified()) return next();

  const encoded = await bcrypt.hash(this.password, 12);
  this.password = encoded;
  this.passwordConfirm = undefined;
  next();
});

// To Remove Deleted users from list
UserScheme.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model("User", UserScheme);

module.exports = User;
