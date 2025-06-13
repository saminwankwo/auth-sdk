
jest.mock('../../../src/models/Otp', () => ({
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({ consumed: false, expiresAt: new Date(Date.now() + 10000), save: jest.fn() })
  }));
  jest.mock('../../../src/services/provider/EmailProvider');
  jest.mock('../../../src/services/provider/SmsProvider');
  
  const Otp = require('../../../src/models/Otp');
  const EmailProvider = require('../../../src/services/provider/EmailProvider');
  const SmsProvider = require('../../../src/services/provider/SmsProvider');
  const OtpService = require('../../../src/services/OtpService');
  
  describe('OtpService', () => {
    const config = { providers: { email: {}, sms: {} }, otpTtl: 300000 };
    let service;
    let mockEmailSend;
    let mockSmsSend;
  
    beforeAll(() => {
      mockEmailSend = jest.fn().mockResolvedValue({});
      mockSmsSend = jest.fn().mockResolvedValue({});
      EmailProvider.mockImplementation(() => ({ send: mockEmailSend }));
      SmsProvider.mockImplementation(() => ({ send: mockSmsSend }));
      service = new OtpService(config);
    });
  
    test('generateAndSend for email saves OTP and calls EmailProvider', async () => {
      const result = await service.generateAndSend('user1', 'user@example.com', 'email');
      expect(Otp.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', type: 'email' }));
      expect(mockEmailSend).toHaveBeenCalledWith({ to: 'user@example.com', subject: 'Your OTP Code', text: expect.stringContaining('Your OTP is') });
    });
  
    test('generateAndSend for sms saves OTP and calls SmsProvider', async () => {
      const result = await service.generateAndSend('user2', '+1234567890', 'sms');
      expect(Otp.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user2', type: 'sms' }));
      expect(mockSmsSend).toHaveBeenCalledWith({ to: '+1234567890', body: expect.stringContaining('Your OTP is') });
    });
  
    test('verify throws on invalid or expired OTP', async () => {
      Otp.findOne.mockResolvedValueOnce(null);
      await expect(service.verify('userX', '000000', 'email')).rejects.toThrow('Invalid or expired OTP');
    });
  
    test('verify marks OTP consumed and returns true', async () => {
      const recordMock = { consumed: false, expiresAt: new Date(Date.now() + 10000), save: jest.fn() };
      Otp.findOne.mockResolvedValueOnce(recordMock);
      const ok = await service.verify('userY', '123456', 'sms');
      expect(recordMock.consumed).toBe(true);
      expect(recordMock.save).toHaveBeenCalled();
      expect(ok).toBe(true);
    });
  });
  