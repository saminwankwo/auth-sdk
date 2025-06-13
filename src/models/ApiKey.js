const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  keyHash: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  scopes: [String],
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false }
});

// Helper to hash raw key
apiKeySchema.statics.hashKey = function(rawKey) {
  return crypto.createHmac('sha256', process.env.API_KEY_SECRET)
    .update(rawKey)
    .digest('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
('ApiKey', apiKeySchema);
