const express = require("express");
const replyController = require("./../controllers/replyController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/:comment")
  .get(replyController.getAllReplies)
  .post(replyController.createReply)
  .patch(replyController.updateReply)
  .delete(replyController.deleteReply);

module.exports = router;
