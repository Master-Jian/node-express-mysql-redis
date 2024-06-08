const Redis = require("ioredis");
require("dotenv").config();

class client {
  constructor(options = {}) {
    // 默认配置，可以根据需要调整
    const defaultOptions = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      // 如果 Redis 设置了密码，可以在这里添加
      // password: process.env.REDIS_PASSWORD,
    };

    // 合并默认配置和传入的选项
    this.options = { ...defaultOptions, ...options };

    // 创建 Redis 客户端实例
    this.client = new Redis(this.options);

    // 监听连接事件
    this.client.on("connect", () => {
      console.log("Redis client connected");
    });

    // 监听错误事件
    this.client.on("error", (err) => {
      console.error("Redis client error", err);
    });
  }

  // 封装一个通用的 get 方法
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (err) {
      console.error("Error getting key", key, err);
      throw err; // 可以选择重新抛出错误或进行其他处理
    }
  }

  // 封装一个通用的 set 方法
  async set(key, value, ttl = null) {
    try {
      // 如果 ttl 参数提供了过期时间，则设置过期时间
      if (ttl) {
        await this.client.set(key, value, "EX", ttl);
      } else {
        await this.client.set(key, value);
      }
      console.log(`Set key ${key} to ${value}`);
    } catch (err) {
      console.error("Error setting key", key, err);
      throw err;
    }
  }

  // 封装一个通用的 del 方法
  async del(key) {
    try {
      const value = await this.client.del(key);
      return value;
    } catch (err) {
      console.error("Error getting key", key, err);
      throw err; // 可以选择重新抛出错误或进行其他处理
    }
  }

  // 封装一个通用的 extendExpiry延时 方法
  async extendExpiry(key, ttl) {
    try {
      // 使用 EXPIRE 命令延长键的过期时间
      await this.client.expire(key, ttl);
      console.log(`Extended expiry for key ${key} by ${ttl} seconds`);
    } catch (err) {
      console.error("Error extending expiry for key", key, err);
      throw err;
    }
  }

  /**
   * 验证token
   * @param argToken 获取用户的token
   */
  async isTokenValid(argToken) {
    try {
      const data = await this.client.get(argToken);

      if (data) {
        const { token, timestamp } = JSON.parse(data);

        if (token === argToken) {
          const ttl = await this.client.ttl(token);
          const time = (Date.now() - timestamp) / 1000;
          if (ttl > 0) {
            return { isValid: true, ttl };
            // 如果 超级，但是在 REDIS_PORT 小时内，续token 1天
          } else if (time <= process.env.REDIS_PORT) {
            await this.extendExpiry(token, 24 * 60 * 60);
            return { isValid: true, extended: true };
          }
        }
      }
      console.log(`argToken for user ${userId} is invalid or expired`);
      return false;
    } catch (err) {
      console.error("Error checking argToken validity", err);
      throw err;
    }
  }

  // 添加其他需要的 Redis 操作方法...

  // 断开连接（如果需要手动控制）
  disconnect() {
    this.client.disconnect();
    console.log("Redis client disconnected");
  }
}

// 导出 client 类
module.exports = client;
