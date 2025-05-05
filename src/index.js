const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { loadConfig } = require('./config/loader');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const createAuthRoutes = require('./routes/auth.routes');

class AuthSDK {
  constructor(options = {}) {
    this.config = loadConfig(options.env || process.env);
    this.app = express();
    this.plugins = [];
  }

  registerPlugin(plugin) {
    if (typeof plugin.init === 'function') {
      plugin.init(this);
      this.plugins.push(plugin.name || plugin);
    }
    return this;
  }

  setupMiddlewares() {
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(morgan(this.config.logging.format));
    this.app.use('/health', (req, res) => res.json({ status: 'ok' }));
    return this;
  }

  mountRoutes() {
    const authRouter = createAuthRoutes(this.config);
    this.app.use(this.config.basePath, rateLimiter(this.config.rateLimit), authRouter);
    return this;
  }

  start(port = this.config.port) {
    this.server = this.app.listen(port, () =>{
      logger.info(`AuthSDK listening on port ${port}`);
    });
    return this;
  }

  getServer() {
    return this.server;
  }
}

module.exports = AuthSDK;
