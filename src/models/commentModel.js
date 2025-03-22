const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Comment should belong to a user"],
  },
  content: {
    type: String,
    required: [true, "A comment can not be empty"],
    trim: true,
  },
  reply: {
    type: mongoose.Schema.ObjectId,
    ref: "Comment",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

CommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
