const express = require("express");
const commentController = require("./../controllers/commentController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

router
  .route("/:id")
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
