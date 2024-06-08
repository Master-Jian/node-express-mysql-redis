const success = (message) => {
  return { code: 200, message: message || "操作成功" };
};

const dataSuccess = (data, message) => {
  return { code: 200, data: data || {}, message: message || "操作成功" };
};

const error = (message) => {
  return { code: 500, message: message || "操作失败" };
};
const errors = (code, data, message) => {
  return { code, data, message };
};

module.exports = {
  success,
  dataSuccess,
  error,
  errors,
};
