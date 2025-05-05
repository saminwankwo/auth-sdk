const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rbacMiddleware = require('../middleware/rbac.middleware');

module.exports = (config) => {
  const router = express.Router();
  const ctrl = new AuthController(config);

  router.post('/register', ctrl.register.bind(ctrl));
  router.post('/verify', ctrl.verify.bind(ctrl));
  router.post('/login', ctrl.login.bind(ctrl));
  router.post('/refresh', ctrl.refresh.bind(ctrl));

  router.post(
    '/change-password',
    authMiddleware(config).verifyToken,
    rbacMiddleware(config).allow('user','admin'),
    ctrl.changePassword.bind(ctrl)
  );

  if (config.plugins.includes('oauth')) {
    const oauthRoutes = require('../plugins/oauthPlugin').router(config);
    router.use('/oauth', oauthRoutes);
  }

  return router;
};