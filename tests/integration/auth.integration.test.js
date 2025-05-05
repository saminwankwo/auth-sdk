
const request = require('supertest');
const express = require('express');
const AuthSDK = require('../../src/index'); // adjust path as needed
const mongoose = require('mongoose');
require('dotenv').config();

describe('Auth Integration', () => {
  let app;
  beforeAll(async () => {
    // Initialize SDK with test config
    const sdk = new AuthSDK({ env: process.env });
    sdk.setupMiddlewares().mountRoutes();
    app = sdk.app;
    // Connect to test DB (e.g., in-memory MongoDB)
    await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('Register & verify flow', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'int@test.com', phone: '+100000', password: 'Pass123!', type: 'email' });
    expect(regRes.status).toBe(201);

    const { userId } = regRes.body;
    const OtpModel = require('../../src/models/Otp');
    const otpRecord = await OtpModel.findOne({ userId, type: 'email' });
    expect(otpRecord).not.toBeNull();

    const verRes = await request(app)
      .post('/api/auth/verify')
      .send({ userId, code: otpRecord.code, type: 'email' });
    expect(verRes.status).toBe(200);
    expect(verRes.body).toHaveProperty('accessToken');
  });

  test('Login & refresh tokens', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'int@test.com', password: 'Pass123!' });
    expect(loginRes.status).toBe(200);
    const { accessToken, refreshToken } = loginRes.body;

    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'Pass123!', newPassword: 'NewPass123!' });
    expect(changeRes.status).toBe(200);

    const refRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(refRes.status).toBe(200);
    expect(refRes.body).toHaveProperty('accessToken');
  });
});
