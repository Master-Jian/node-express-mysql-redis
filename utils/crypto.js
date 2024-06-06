const crypto = require('crypto');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * 创建token
 * @param {*} payload 
 */
const createToken = (payload) => {
    // JWT header
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    // JWT payload
    const payloadStr = JSON.stringify(payload);
  
    // Base64 encode the header and payload
    const base64Header = Buffer.from(header).toString('base64');
    const base64Payload = Buffer.from(payloadStr).toString('base64');
  
    // Concatenate header and payload
    const data = `${base64Header}.${base64Payload}`;
  
    // Create a signature using HMAC SHA256
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64');
  
    // Concatenate data and signature to form the JWT
    return `${data}.${signature}`;
  }
  
  /**
   *  解密和验证 token
   */
const verifyToken = (token) => {
    const [base64Header, base64Payload, receivedSignature] = token.split('.');
  
    const data = `${base64Header}.${base64Payload}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64');
  
    if (expectedSignature !== receivedSignature) {
      throw new Error('Invalid token signature');
    }
  
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  };
  

module.exports = {
    createToken,
    verifyToken,
  };
  

