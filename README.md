====================================
Quickstart & Usage Documentation
====================================

# Installation

```bash
npm install auth-sdk-express
# or
yarn add auth-sdk-express
```

# Environment Variables

Create a `.env` file at your project root with:
```
PORT=3000
BASE_PATH=/api/auth

# JWT secrets
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate limiting
RATE_WINDOW_MS=60000
RATE_MAX=100
RATE_MESSAGE=Too many requests

# Logging
LOG_LEVEL=info
LOG_FORMAT=dev

# Email provider (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# SMS provider (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Blacklist store (optional: redis)
BLACKLIST_STORE=memory
# For Redis, set REDIS_URL or REDIS_HOST, etc. via options

# Plugins (comma-separated):
PLUGINS=oauth
```

# Basic Setup Example

```js
// server.js
require('dotenv').config();
const AuthSDK = require('auth-sdk-express');

(async () => {
  const sdk = new AuthSDK(); // loads from process.env
  sdk.setupMiddlewares()
     .mountRoutes()
     .start();
})();
```

The SDK will expose routes under `/api/auth` by default:

- `POST /api/auth/register`  — register & send OTP
- `POST /api/auth/verify`    — verify OTP & receive tokens
- `POST /api/auth/login`     — login with email/password
- `POST /api/auth/refresh`   — refresh JWT tokens
- `POST /api/auth/change-password` (protected)

# Custom Configuration

You can pass overrides to the constructor:
```js
const sdk = new AuthSDK({
  env: { ...process.env, PORT: 4000 },
  // or supply custom config object directly
});
```

# Adding Plugins

To enable OAuth plugin:

```js
sdk.registerPlugin(require('auth-sdk-express/src/plugins/oauthPlugin'));
```

# Extending OTP Types

You can call OTP service directly:
```js
const { OtpService } = require('auth-sdk-express').services;
const otp = new OtpService(sdk.config);
await otp.generateAndSend(userId, userEmail, 'email');
```


## API Key Management

1. **Generate a new key**
```js
const { ApiKeyService } = require('auth-sdk-express/src/services/ApiKeyService');
const keySvc = new ApiKeyService();

// owner = e.g., service name or developer email
const { key, id } = await keySvc.generate('my-service', ['read:users', 'write:orders']);
console.log('Your new API key:', key);
```

2. **Rotate an existing key**
```js
const { key: newKey } = await keySvc.rotate(oldRawKey);
console.log('Rotated key:', newKey);
```

3. **Revoke a key**
```js
await keySvc.revoke({ key: rawKey });
```

4. **Protect routes using API key middleware**
```js
const apiKey = require('auth-sdk-express/src/middleware/apiKey.middleware');

app.get('/protected', apiKey('read:users'), (req, res) => {
  res.json({ data: 'Secure data' });
});
```
