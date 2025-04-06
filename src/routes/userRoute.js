const express = require("express");

const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router
  .route("/authenticated")
  .get(authController.protect, authController.authenticated);
router.route("/login").post(authController.login);
router.route("/signup").post(authController.signup);
router.route("/logout").get(authController.logout);
router.route("/verify/:token").get(authController.verify);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").post(authController.resetPassword);

router.use(authController.protect);

router
  .route("/me")
  .patch(
    userController.uploadUserPhoto,
    userController.ResizeImage,
    userController.updateMe
  );

module.exports = router;
