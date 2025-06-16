# 🔐 Auth SDK for Express.js

A plug-and-play authentication & authorization SDK built for Express applications. Supports JWT access/refresh tokens, OTP via email/SMS, API key management, rate limiting, and pluggable providers like OAuth.

---

## 🚀 Quickstart

### 📦 Installation

```bash
npm install @saminwankwo/auth-sdk
# or
yarn add @saminwankwo/auth-sdk
```

---

## ⚙️ Environment Configuration

Create a `.env` file at your project root:

```env
# Server
PORT=3000
BASE_PATH=/api/auth

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_WINDOW_MS=60000
RATE_MAX=100
RATE_MESSAGE=Too many requests

# Logging
LOG_LEVEL=info
LOG_FORMAT=dev

# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Blacklist Storage
BLACKLIST_STORE=memory
# Optional Redis: REDIS_URL or REDIS_HOST=localhost

# Plugins
PLUGINS=oauth
```

---

## 🔧 Basic Usage

```js
// server.js
require('dotenv').config();
const AuthSDK = require('auth-sdk-express');

(async () => {
  const sdk = new AuthSDK(); // Uses process.env by default
  sdk.setupMiddlewares()
     .mountRoutes()
     .start();
})();
```

By default, routes are available under `/api/auth`:

| Method | Route                     | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | `/register`               | Register and send OTP     |
| POST   | `/verify`                 | Verify OTP and get tokens |
| POST   | `/login`                  | Email/password login      |
| POST   | `/refresh`                | Refresh JWT tokens        |
| POST   | `/change-password` (auth) | Change user password      |

---

## 🛠 Custom Configuration

You can override environment settings:

```js
const sdk = new AuthSDK({
  env: {
    ...process.env,
    PORT: 4000,
  },
});
```

---

## 🔌 Adding Plugins

Enable OAuth or any custom plugin:

```js
sdk.registerPlugin(require('auth-sdk-express/src/plugins/oauthPlugin'));
```

---

## 🔁 Using the OTP Service

Generate and send OTP programmatically:

```js
const { OtpService } = require('auth-sdk-express').services;
const otp = new OtpService(sdk.config);

await otp.generateAndSend(userId, userEmail, 'email');
```

---

## 🔑 API Key Management

### 1. Generate a New Key

```js
const { ApiKeyService } = require('auth-sdk-express/src/services/ApiKeyService');
const keySvc = new ApiKeyService();

const { key, id } = await keySvc.generate('my-service', ['read:users', 'write:orders']);
console.log('API Key:', key);
```

### 2. Rotate an Existing Key

```js
const { key: newKey } = await keySvc.rotate(oldRawKey);
console.log('New API Key:', newKey);
```

### 3. Revoke a Key

```js
await keySvc.revoke({ key: rawKey });
```

### 4. Secure Routes with API Key Middleware

```js
const apiKey = require('auth-sdk-express/src/middleware/apiKey.middleware');

app.get('/protected', apiKey('read:users'), (req, res) => {
  res.json({ message: 'Secure content' });
});
```

---

## 💡 Contributing

Got an idea or found a bug? PRs and issues are welcome on [GitHub](https://github.com/saminwankwo/auth-sdk)!

---

## 📄 License

MIT © [Nwankwo Samuel](https://github.com/saminwankwo)
