const Reply = require("./../models/replyModel");
const catchAsync = require("./../services/catchAsync");
const customError = require("./../services/customError");
const apiFeatures = require("./../services/apiFeatures");

exports.getAllReplies = catchAsync(async (req, res, next) => {
  const { comment } = req.params || req.body;

  const features = new apiFeatures(Reply.find({ comment: comment }), req.query)
    .filter()
    .sort()
    .pagination()
    .limitFields();

  const replies = await features.query;
  res
    .status(200)
    .json({ status: "success", results: replies.length, data: replies });
});

exports.createReply = catchAsync(async (req, res, next) => {
  const comment = req.body.comment || req.params.comment;
  const replyId = req.body.reply || null;
  const reply = await Reply.create({
    user: req.user.id,
    content: req.body.content,
    comment,
    reply: replyId,
  });

  res.status(200).json({ status: "success", data: reply });
});

exports.deleteReply = catchAsync(async (req, res, next) => {
  const { comment } = req.params || req.body;
  const reply = await Reply.findById(comment);

  if (!reply) return next(new customError("No reply found", 400));
  if (!(req.user.id == reply.user.id)) {
    return next(
      new customError("You are not allowed to perform this action", 400)
    );
  }
  await reply.deleteOne();

  res.status(204).json({ status: "success" });
});

exports.updateReply = catchAsync(async (req, res, next) => {
  const { comment } = req.params || req.body;
  const reply = await Reply.findById(comment);
  if (!reply) return next(new customError("No reply found", 400));
  if (!(req.user.id == reply.user.id)) {
    return next(
      new customError("You are not allowed to perform this action", 400)
    );
  }

  const newReply = await Reply.findByIdAndUpdate(comment, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: newReply });
});
