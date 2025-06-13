const jwt = require('jsonwebtoken');
const TokenService = require('../services/TokenService');

module.exports = (config) => {
  return {
    verifyToken: async (req, res, next) => {
      try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) throw new Error('No token');
        const token = header.split(' ')[1];
        // check blacklist
        if (await TokenService.isRevoked(token)) throw new Error('Revoked');
        const payload = jwt.verify(token, config.jwt.accessSecret);
        req.user = payload;
        next();
      } catch (e) {
        res.status(401).json({ message: 'Unauthorized' });
      }
    }
  };
};