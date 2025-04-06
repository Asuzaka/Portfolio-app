const mongoose = require("mongoose");

const ReplyScheme = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Reply should belong to a user"],
  },
  content: {
    type: String,
    required: [true, "A Reply can not be empty"],
    trim: true,
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: "Comment",
    required: [true, "A reply must have a comment"],
  },
  reply: {
    type: mongoose.Schema.ObjectId,
    ref: "Reply",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

ReplyScheme.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

const Reply = mongoose.model("Reply", ReplyScheme);

module.exports = Reply;
