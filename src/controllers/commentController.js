const Comment = require("./../models/commentModel");
const Reply = require("./../models/replyModel");

const catchAsync = require("./../services/catchAsync");
const customError = require("./../services/customError");
const apiFeatures = require("./../services/apiFeatures");

exports.getAllComments = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(Comment.find(), req.query)
    .filter()
    .sort()
    .pagination()
    .limitFields();

  const comments = await features.query.lean();

  // Get all comments id
  const commentIds = comments.map((c) => c._id);

  // Fetch all replies
  const replies = await Reply.find({ comment: { $in: commentIds } }).select(
    "_id comment"
  );
  // Group replies by comment id
  const groupedReplies = {};
  replies.forEach((reply) => {
    const commentId = reply.comment.toString();
    if (!groupedReplies[commentId]) groupedReplies[commentId] = [];
    groupedReplies[commentId].push(reply._id);
  });

  // Attach reply ids to comments
  const commentsWithReplyIds = comments.map((comment) => {
    const replyIds = groupedReplies[comment._id.toString()] || [];
    return {
      ...comment,
      replies: replyIds,
    };
  });

  res.status(200).json({
    status: "success",
    results: commentsWithReplyIds.length,
    data: commentsWithReplyIds,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const reply = req.body.reply || null;
  const comment = await Comment.create({
    user: req.user.id,
    content: req.body.content,
    reply,
  });

  res.status(200).json({ status: "success", data: comment });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const id = req.params.id || req.body.id;
  const comment = await Comment.findById(id);

  if (!comment) return next(new customError("No comment found", 400));
  if (!(req.user.id == comment.user.id)) {
    return next(
      new customError("You are not allowed to perform this action", 400)
    );
  }
  await comment.deleteOne();

  res.status(204).json({ status: "success" });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const id = req.params.id || req.body.id;
  const comment = await Comment.findById(id);
  if (!comment) return next(new customError("No comment found", 400));
  if (!(req.user.id == comment.user.id)) {
    return next(
      new customError("You are not allowed to perform this action", 400)
    );
  }

  const newComment = await Comment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: newComment });
});

exports.getUserComments = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comments = await Comment.find({ user: id });

  res
    .status(200)
    .json({ status: "success", results: comments.length, data: comments });
});
