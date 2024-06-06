const express = require("express");
const router = express.Router();

const UserRouter = require("./module/user");
const LoginRouter = require("./module/login");
const message = require("../utils/message");
const RedisClient = require("../utils/redisClient");

router.use("/login", LoginRouter);

// 验证token
router.use(function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.send(message.errors(401, {}, "请先登录")); // 如果没有提供 token，返回 401 未授权
  }
  // 验证 token 的有效性
  const redisClient = new RedisClient();
  redisClient
    .isTokenValid(token)(token)
    .then((isValid) => {
      if (!isValid) {
        return res.send(message.errors(403, {}, "请先登录"));
      }
      next(); // 如果 token 有效，继续处理请求
    })
    .catch((err) => {
      console.error("Error verifying token:", err);
      res.sendStatus(500); // 服务器内部错误
    });
  next();
});

router.use("/user", UserRouter);

module.exports = router;
