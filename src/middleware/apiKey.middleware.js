const ApiKeyService = require('../services/ApiKeyService');
module.exports = (requiredScope) => async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ message: 'API key required' });
  const service = new ApiKeyService();
  if (!(await service.validate(key, requiredScope))) {
    return res.status(403).json({ message: 'Forbidden: invalid or insufficient API key' });
  }
  req.apiKey = key;
  next();
};
