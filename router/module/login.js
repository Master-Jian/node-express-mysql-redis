const express = require("express");
const router = express.Router();
const login = require("../../db/public/loginController");

/**
 * 密码登录
 * api/login/password
 */
router.post("/password", login.pwdToLogin);

/**
 * 注册
 * api/login/register
 */
router.post("/register", login.registerUser);


/**
 * 验证码
 * api/user/sendCode
 */
router.get("/sendCode", userController.sendCode);


module.exports = router;
