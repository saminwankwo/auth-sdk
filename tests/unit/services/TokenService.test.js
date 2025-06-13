const jwt = require('jsonwebtoken');
const TokenService = require('../../../src/services/TokenService');

// Mock storageFactory to use a simple in-memory store
jest.mock('../../../src/utils/storageFactory', () => {
  return jest.fn().mockImplementation(() => ({
    _store: new Map(),
    async set(key, value, ttl) { this._store.set(key, true); },
    async get(key) { return this._store.has(key); },
    async del(key) { this._store.delete(key); }
  }));
});

describe('TokenService', () => {
  const config = {
    jwt: {
      accessSecret: 'access-secret',
      refreshSecret: 'refresh-secret',
      accessExpiresIn: '1h',
      refreshExpiresIn: '7d'
    },
    storage: {
      tokenBlacklist: { type: 'memory', options: {} }
    }
  };
  let service;

  beforeAll(() => {
    service = new TokenService(config);
  });

  test('generateTokens returns access and refresh tokens', () => {
    const payload = { sub: 'user1', roles: ['user'] };
    const tokens = service.generateTokens(payload);
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
  });

  test('verifyAccess throws on invalid token', () => {
    expect(() => service.verifyAccess('bad.token')).toThrow();
  });

  test('verifyRefresh throws on invalid token', () => {
    expect(() => service.verifyRefresh('bad.token')).toThrow();
  });

  test('revokeToken blacklists a token', async () => {
    const payload = { sub: 'user2' };
    const { accessToken } = service.generateTokens(payload);
    await service.revokeToken(accessToken);
    const isRevoked = await service.isRevoked(accessToken);
    expect(isRevoked).toBe(true);
  });

  test('isRevoked returns false for non-blacklisted token', async () => {
    const payload = { sub: 'user3' };
    const { accessToken } = service.generateTokens(payload);
    const isRevoked = await service.isRevoked(accessToken);
    expect(isRevoked).toBe(false);
  });

  test('verifyAccess returns payload for valid token', () => {
    const payload = { sub: 'user4' };
    const { accessToken } = service.generateTokens(payload);
    const decoded = service.verifyAccess(accessToken);
    expect(decoded.sub).toBe('user4');
  });

  test('verifyRefresh returns payload for valid refresh token', () => {
    const payload = { sub: 'user5' };
    const { refreshToken } = service.generateTokens(payload);
    const decoded = service.verifyRefresh(refreshToken);
    expect(decoded.sub).toBe('user5');
  });
});
