const express = require("express");
const router = express.Router();

//Import the controllers from the AuthN 
const {sendOTP, signUp, login, changePassword} = require("../controllers/AuthN");
const {resetPasswordToken, resetPassword} = require("../controllers/ResetPassword");

//Import the middleware
const {auth} = require("../middlewares/AuthZ");

//Creating routes for AuthN controllers
router.post("/sendOTP", sendOTP);
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/changePassword", auth, changePassword);

//Creating routes for ResetPassword controllers
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;