const mySql = require("mysql");
require('dotenv').config();

const database = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

module.exports = {
  // 连接数据库，使用mysql的连接池连接方式
  /**
   * 连接池对象
   * @param {*} sql sql语句
   * @param {*} sqlArr 参数值数组
   * @param {*} callback 回调
   */
  sqlConnect: function (sql, sqlArr, callback) {
    var pool = mySql.createPool(database);
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("连接失败");
        return;
      }

      // 事件驱动回调
      connection.query(sql, sqlArr, callback);
      // 释放连接
      connection.release();
    });
  },
};
