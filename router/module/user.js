const express = require("express");
const router = express.Router();
const userController = require("../../db/front/userController");

/**
 * 用户详情
 * api/user/info
 */
router.get("/info", (req, res, next) => {
  res.send("info");
});

/**
 * 修改密码
 * api/login/updatePwd
 */
router.post("/updatePwd", login.updatePassword);

module.exports = router;
