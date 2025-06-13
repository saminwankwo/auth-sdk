const storageFactory = require('../../../src/utils/storageFactory');

jest.useFakeTimers();

describe('MemoryStore', () => {
  let store;
  beforeEach(() => {
    store = storageFactory({ type: 'memory' });
  });

  test('should set and get a key within TTL', async () => {
    await store.set('testKey', true, 1000);
    expect(await store.get('testKey')).toBe(true);
  });

  test('should delete key after TTL expires', async () => {
    await store.set('temp', true, 500);
    expect(await store.get('temp')).toBe(true);
    jest.advanceTimersByTime(500);
    expect(await store.get('temp')).toBe(false);
  });

  test('get returns false for non-existent key', async () => {
    expect(await store.get('nope')).toBe(false);
  });
});

// Mock Redis client for RedisStore
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    _data: {},
    set(key, value, exFlag, seconds) {
      this._data[key] = { value, expires: Date.now() + seconds * 1000 };
      return Promise.resolve('OK');
    },
    get(key) {
      const rec = this._data[key];
      if (!rec || rec.expires < Date.now()) return Promise.resolve(null);
      return Promise.resolve(rec.value);
    },
    del(key) {
      delete this._data[key];
      return Promise.resolve(1);
    }
  }));
});

describe('RedisStore', () => {
  let store;
  beforeEach(() => {
    store = storageFactory({ type: 'redis', options: {} });
  });

  test('should set and get a key before expiration', async () => {
    await store.set('rKey', true, 2000);
    expect(await store.get('rKey')).toBe(true);
  });

  test('should return false after expiration', async () => {
    await store.set('rTemp', true, 100);
    // simulate wait
    jest.advanceTimersByTime(100);
    expect(await store.get('rTemp')).toBe(false);
  });

  test('del should remove key', async () => {
    await store.set('toDel', true, 1000);
    expect(await store.get('toDel')).toBe(true);
    await store.del('toDel');
    expect(await store.get('toDel')).toBe(false);
  });
});
