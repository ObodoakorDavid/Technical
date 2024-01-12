const express = require("express");
const {
  signupUser,
  loginUser,
  passwordReset,
  activateEmail,
} = require("../controllers/authController");
const methodNotAllowed = require("../utils/methodNotAllowed");
const router = express.Router();

router.route("/signup").post(signupUser).all(methodNotAllowed);
router.route("/login").post(loginUser).all(methodNotAllowed);
router.route("/activate/:token").post(activateEmail).all(methodNotAllowed);
router.route("/password_reset").post(passwordReset).all(methodNotAllowed);

module.exports = router;
