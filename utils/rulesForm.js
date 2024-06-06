/**
 * 校验手机
 */
const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
* 校验邮箱
*/
const validateEmail = (email) => {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

module.exports = {
  validatePhone,
  validateEmail,
};
