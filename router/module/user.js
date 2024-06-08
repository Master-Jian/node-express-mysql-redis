const express = require("express");
const router = express.Router();
const userController = require("../../db/front/userController");

/**
 * 用户详情
 * api/user/info
 */
router.get("/info", userController.getUserInfo);

/**
 * 修改密码
 * api/user/updatePwd
 */
router.post("/updatePwd", userController.updatePassword);

module.exports = router;
