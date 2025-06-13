const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

class ApiKeyService {
  constructor() {
    this.secret = process.env.API_KEY_SECRET;
  }

  // Generate new API key (returns raw key, stores hash)
  async generate(owner, scopes = []) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const keyHash = ApiKey.hashKey(rawKey);
    const record = await ApiKey.create({ keyHash, owner, scopes });
    return { key: rawKey, id: record._id, scopes, owner };
  }

  // Rotate existing key: revoke old and create new
  async rotate(oldRawKey) {
    const oldHash = ApiKey.hashKey(oldRawKey);
    const old = await ApiKey.findOneAndUpdate({ keyHash: oldHash, revoked: false }, { revoked: true });
    if (!old) throw new Error('API key not found or already revoked');
    return this.generate(old.owner, old.scopes);
  }

  // Revoke by raw key or id
  async revoke({ key, id }) {
    let filter = id ? { _id: id } : { keyHash: ApiKey.hashKey(key) };
    return ApiKey.findOneAndUpdate(filter, { revoked: true });
  }

  // Validate raw key and optional scope
  async validate(rawKey, requiredScope) {
    const hash = ApiKey.hashKey(rawKey);
    const record = await ApiKey.findOne({ keyHash: hash, revoked: false });
    if (!record) return false;
    if (requiredScope && !record.scopes.includes(requiredScope)) return false;
    return true;
  }
}

module.exports = ApiKeyService;
