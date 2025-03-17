const express = require("express");

const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/login").post(authController.login);
router.route("/signup").post(authController.signup);
router.route("/verify/:token").get(authController.verify);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").post(authController.resetPassword);

router.route("/");

module.exports = router;
