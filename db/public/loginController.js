const bcrypt = require("bcrypt");
const dbConfig = require("../../utils/dbConfig");
const message = require("../../utils/message");
const rulesForm = require("../../utils/rulesForm");
const { createToken } = require("../../utils/crypto");
const RedisClient = require("../../utils/redisClient");

/**
 * 用户名/手机 密码 - 登录
 */
pwdToLogin = (req, res) => {
  const { userName, phone, password } = req.body;
  if (!userName && !phone) {
    return res.send(message.error("用户名/手机号不能为空"));
  } else if (!rulesForm.validatePhone(phone)) {
    return res.send(message.error("手机号错误"));
  } else if (!password) {
    return res.send(message.error("密码不能为空"));
  }

  try {
    // 构建查询语句和参数
    let sql;
    let sqlArr;

    if (userName) {
      sql = "SELECT * FROM user WHERE userName = ?";
      sqlArr = [userName];
    } else if (phone) {
      sql = "SELECT * FROM user WHERE phone = ?";
      sqlArr = [phone];
    }

    dbConfig.sqlConnect(sql, sqlArr, async function (err, result) {
      if (err) {
        console.error("Error querying user:", err);
        return res.send(message.error("用户不存在"));
      }

      if (result.length === 0) {
        return res.send(message.error("用户不存在"));
      }

      const user = result[0];
      if (!user.pwd) {
        return res.send(message.error("密码错误"));
      }

      // 校验密码
      const isMatch = await bcrypt.compare(password, user.pwd);
      if (!isMatch) {
        return res.send(message.error("密码错误"));
      }

      const payload = {
        userId: user.id,
        phone: user.phone,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day expiration
      };

      const token = createToken(payload);

      const redisClient = new RedisClient();
      // 存入token 和 当前时间戳 无感续时
      const timestamp = Date.now();
      const tokenKey = JSON.stringify({ token, timestamp });
      // 设置24小时
      await redisClient.set(token, tokenKey, 24 * 60 * 60);
      redisClient.disconnect();

      // 登录成功
      res.send(
        message.dataSuccess(
          {
            uid: user.id,
            token: token,
          },
          "登录成功"
        )
      );
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.send(message.error("登录失败"));
  }
};

/**
 * 用户名/手机 密码 - 注册
 */
const registerUser = async (req, res) => {
  const { userName, phone, password } = req.body;
  if (!userName && !phone) {
    return res.send(message.error("用户名/手机号不能为空"));
  } else if (rulesForm.validatePhone(phone)) {
    return res.send(message.error("手机号错误"));
  } else if (!password) {
    return res.send(message.error("密码不能为空"));
  }

  try {
    // 检查用户名或手机号是否已存在
    let userExistsQuery;
    let userExistsValues;

    if (userName) {
      userExistsQuery = "SELECT COUNT(*) AS count FROM user WHERE userName = ?";
      userExistsValues = [userName];
    } else {
      userExistsQuery = "SELECT COUNT(*) AS count FROM user WHERE phone = ?";
      userExistsValues = [phone];
    }

    dbConfig.sqlConnect(
      userExistsQuery,
      userExistsValues,
      async function (err, result) {
        if (err) {
          console.error("Error checking user existence:", err);
          return res.send({ error: message.error() });
        }

        const count = result[0].count;
        if (count > 0) {
          const msg = userName ? "用户名" : "手机号";
          return res.send(message.error(`该${msg}已被注册`));
        }

        // 注册
        const hashedPassword = await bcrypt.hash(String(password), 10);
        let insertUserQuery = "INSERT INTO user (userName, pwd) VALUES (?, ?)";
        let insertUserValues = [userName, hashedPassword];

        if (phone) {
          insertUserQuery = "INSERT INTO user (phone, pwd) VALUES (?, ?)";
          insertUserValues = [phone, hashedPassword];
        }

        dbConfig.sqlConnect(
          insertUserQuery,
          insertUserValues,
          function (insertErr, insertResult) {
            if (insertErr) {
              console.error("Error inserting user:", insertErr);
              return res.send({ error: message.error() });
            }
            res.send(message.success("创建成功"));
          }
        );
      }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res.send(message.error("注册失败"));
  }
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 模拟验证码发送
 */
const sendCode = (req, res) => {
  let phone = req.body.phone;
  let code = rand(1000, 9999);
  res.send({
    code: 200,
    msg: "",
    data: code,
  });
  console.log(code);
};

module.exports = {
  pwdToLogin,
  registerUser,
  sendCode,
};
