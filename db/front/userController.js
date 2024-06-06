const bcrypt = require("bcrypt");
const dbConfig = require("../../utils/dbConfig");
const message = require("../../utils/message");

/**
 * 修改密码
 */
const updatePassword = async (req, res) => {
  const { uid, password, newPassword } = req.body;
  if (!uid) {
    return res.send(message.error("参数传参错误"));
  } else if (!newPassword) {
    return res.send(message.error("新密码不能为空"));
  }

  try {
    // 检查用户名或手机号是否已存在
    const userQuery = "SELECT * FROM user WHERE id = ?";
    const userValues = [uid];

    dbConfig.sqlConnect(userQuery, userValues, async function (err, result) {
      if (err) {
        console.error("Error checking user existence:", err);
        return res.send({ error: message.error() });
      }

      if (result.length === 0) {
        return res.send(message.error("用户不存在"));
      }

      const user = result[0];
      // 校验密码
      if (user.pwd) {
        const isMatch = await bcrypt.compare(password, user.pwd);
        if (!isMatch) {
          return res.send(message.error("密码错误"));
        }
      }

      const hashedPassword = await bcrypt.hash(String(newPassword), 10);
      const insertUserQuery = "UPDATE user SET pwd = ? WHERE id = ?";
      const insertUserValues = [hashedPassword, uid];

      dbConfig.sqlConnect(
        insertUserQuery,
        insertUserValues,
        function (insertErr, insertResult) {
          if (insertErr) {
            console.error("Error inserting user:", insertErr);
            return res.send({ error: message.error() });
          }
          res.send(message.success("修改成功"));
        }
      );
    });
  } catch (error) {
    console.error("Error password user:", error);
    res.send(message.error("修改失败"));
  }
};

module.exports = {
    updatePassword
};