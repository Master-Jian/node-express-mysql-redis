const express = require("express");
const router = express.Router();

const UserRouter = require("./module/user");
const LoginRouter = require("./module/login");
const message = require("../utils/message");
const RedisClient = require("../utils/redisClient");
const { verifyToken } = require("../utils/crypto");
const dbConfig = require("../utils/dbConfig");

router.use("/login", LoginRouter);

// 验证token
router.use(async function (req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.send(message.errors(401, {}, "请先登录")); // 如果没有提供 token，返回 401 未授权
  }

  const redisClient = new RedisClient();

  try {
    const isValid = await redisClient.isTokenValid(token);
    redisClient.disconnect();

    if (!isValid) {
      return res.send(message.errors(403, {}, "请先登录"));
    }
    const user = verifyToken(token);
    if (!user) {
      console.log("查询不到用户");
      return res.send(message.error());
    }
    // 将user用户信息直接获取出来
    // 因很多地方用到，每次在此处都提取下

    const userQuery = "SELECT * FROM user WHERE id = ?";
    const userValues = [user.userId];
    dbConfig.sqlConnect(userQuery, userValues, function (err, result) {
      if (err) {
        console.error("Error checking user existence:", err);
        return res.send(message.error());
      }

      if (result.length === 0) {
        return res.send(message.error("用户不存在"));
      }

      const userInfo = result[0];
      req.user = userInfo;
      next(); // 如果 token 有效，继续处理请求
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    redisClient.disconnect();
    return res.send(message.error()); // 服务器内部错误
  }
});

router.use("/user", UserRouter);

module.exports = router;
