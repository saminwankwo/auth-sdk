const jwt = require('jsonwebtoken');
const storageFactory = require('../utils/storageFactory');

class TokenService {
  constructor(config) {
    this.accessSecret = config.jwt.accessSecret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.accessExpiresIn = config.jwt.accessExpiresIn;
    this.refreshExpiresIn = config.jwt.refreshExpiresIn;
    this.blacklistStore = storageFactory(config.storage.tokenBlacklist);
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn });
    const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
    return { accessToken, refreshToken };
  }

  async revokeToken(token) {
    const decoded = jwt.decode(token);
    const exp = decoded.exp * 1000;
    const ttl = exp - Date.now();
    if (ttl > 0) {
      await this.blacklistStore.set(token, true, ttl);
    }
  }

  async isRevoked(token) {
    return this.blacklistStore.get(token);
  }

  verifyAccess(token) {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefresh(token) {
    return jwt.verify(token, this.refreshSecret);
  }
}

module.exports = TokenService;
