const Comment = require("./../models/commentModel");
const catchAsync = require("./../services/catchAsync");
const customError = require("./../services/customError");
const apiFeatures = require("./../services/apiFeatures");

exports.getAllComments = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(Comment.find(), req.query)
    .filter()
    .sort()
    .pagination()
    .limitFields();

  const comments = await features.query;
  res
    .status(200)
    .json({ status: "success", results: comments.length, data: comments });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const reply = req.body.reply || undefined;
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
  if (!(req.user.id == comment.user.id)) {
    return next(
      new customError("You are not allowed to perform this action", 400)
    );
  }

  const newComment = await Comment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "succes", data: newComment });
});
