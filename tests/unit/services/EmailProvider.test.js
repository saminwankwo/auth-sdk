jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const EmailProvider = require('../../../src/services/provider/EmailProvider');

describe('EmailProvider', () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'abc123' });
  beforeAll(() => {
    nodemailer.createTransport = jest.fn().mockReturnValue({
      options: { auth: { user: 'test@example.com' } },
      sendMail: mockSendMail
    });
  });

  test('sends email with correct parameters', async () => {
    const provider = new EmailProvider({});
    const mailData = { to: 'user@test.com', subject: 'Test', text: 'Hello', html: '<p>Hello</p>' };
    const info = await provider.send(mailData);
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'test@example.com', ...mailData
    });
    expect(info).toHaveProperty('messageId', 'abc123');
  });
});
