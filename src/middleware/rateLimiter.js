
const rateLimit = require('express-rate-limit');

module.exports = ({ windowMs, max, message }) => rateLimit({ windowMs, max, message });
