const Redis = require('ioredis');

class MemoryStore {
  constructor() {
    this.store = new Map();
  }

  async set(key, value, ttl) {
    this.store.set(key, true);
    setTimeout(() => this.store.delete(key), ttl);
  }

  async get(key) {
    return this.store.has(key) || false;
  }

  async del(key) {
    this.store.delete(key);
  }
}

class RedisStore {
  constructor(options) {
    this.client = new Redis(options);
  }

  async set(key, value, ttl) {
    // ttl in ms; convert to seconds
    const seconds = Math.ceil(ttl / 1000);
    await this.client.set(key, '1', 'EX', seconds);
  }

  async get(key) {
    const result = await this.client.get(key);
    return result === '1';
  }

  async del(key) {
    await this.client.del(key);
  }
}

module.exports = function storageFactory({ type, options }) {
  switch (type) {
    case 'redis':
      return new RedisStore(options);
    case 'memory':
    default:
      return new MemoryStore();
  }
};
