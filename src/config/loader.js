const { authConfigSchema } = require('./schemas');
const Joi = require('joi');

function loadConfig(env) {
  const rawConfig = {
    port: env.PORT,
    basePath: env.BASE_PATH,
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES || env.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES || env.JWT_REFRESH_EXPIRES_IN
    },
    rateLimit: {
      windowMs: env.RATE_WINDOW_MS,
      max: env.RATE_MAX,
      message: env.RATE_MESSAGE
    },
    logging: { format: env.LOG_FORMAT },
    providers: {
      email: {
        host: env.EMAIL_HOST,
        port: +env.EMAIL_PORT,
        secure: env.EMAIL_SECURE === 'true',
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS }
      },
      sms: {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        from: env.TWILIO_PHONE_NUMBER
      }
    },
    storage: {
      tokenBlacklist: {
        type: env.BLACKLIST_STORE || 'memory',
        options: {}
      }
    },
    plugins: env.PLUGINS ? env.PLUGINS.split(',') : []
  };

  const { value, error } = authConfigSchema.validate(rawConfig, { allowUnknown: true });
  if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }
  return value;
}

module.exports = { loadConfig };
