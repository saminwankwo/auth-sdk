jest.mock('twilio');
const twilio = require('twilio');
const SmsProvider = require('../../../src/services/provider/SmsProvider');

describe('SmsProvider', () => {
  const mockCreate = jest.fn().mockResolvedValue({ sid: 'sms123' });
  beforeAll(() => {
    twilio.mockReturnValue({ messages: { create: mockCreate } });
  });

  test('sends sms with correct parameters', async () => {
    const config = { accountSid: 'sid', authToken: 'token', from: '+10000000000' };
    const provider = new SmsProvider(config);
    const msg = await provider.send({ to: '+19999999999', body: 'Test SMS' });
    expect(twilio).toHaveBeenCalledWith('sid', 'token');
    expect(mockCreate).toHaveBeenCalledWith({ from: '+10000000000', to: '+19999999999', body: 'Test SMS' });
    expect(msg).toHaveProperty('sid', 'sms123');
  });
});
