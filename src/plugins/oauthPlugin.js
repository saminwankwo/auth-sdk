const express = require('express');

module.exports = {
  name: 'oauth',
  init(sdk) {
    // e.g., register passport strategies
    // sdk.passport.use(...);
  },
  router(config) {
    const router = express.Router();
    // GET /oauth/:provider
    router.get('/:provider', (req, res) => {
      res.status(501).json({ message: 'OAuth not implemented' });
    });
    return router;
  }
};


