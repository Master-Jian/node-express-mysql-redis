const bcrypt = require("bcrypt");
const dbConfig = require("../../utils/dbConfig");
const message = require("../../utils/message");

/**
 * 修改密码
 */
const updatePassword = async (req, res) => {
  const { user } = req;
  const { password, newPassword } = req.body;
  console.log("updatePasswor ", user);
  if (!newPassword) {
    return res.send(message.error("新密码不能为空"));
  }

  try {
    if (user.pwd && password) {
      const isMatch = await bcrypt.compare(password, user.pwd);
      if (!isMatch) {
        return res.send(message.error("原密码错误"));
      }
    } else {
      return res.send(message.error("原密码不能为空"));
    }
    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    const updateQuery = "UPDATE user SET pwd = ? WHERE id = ?";
    const updateValues = [hashedPassword, user.id];

    dbConfig.sqlConnect(updateQuery, updateValues, function (err, result) {
      if (err) {
        console.error("Error update pawd:", err);
        return res.send(message.error());
      }
      res.send(message.success("修改成功"));
    });
  } catch (error) {
    console.error("Error password user:", error);
    res.send(message.error("修改失败"));
  }
};

/**
 * 获取用户详情
 */
const getUserInfo = (req, res) => {
  try {
    const { user } = req;
    delete user.pwd;
    res.send(message.dataSuccess(user)); // 在这里发送响应并立即返回
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.send(message.error());
  }
};

module.exports = {
  updatePassword,
  getUserInfo,
};
