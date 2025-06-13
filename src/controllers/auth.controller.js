const UserService = require('../services/UserService');

class AuthController {
  // POST /api/auth/register
  static async register(req, res, next) {
    try {
      const { email, phone, password, type } = req.body;
      const result = await UserService.register({ email, phone, password }, type);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/verify
  static async verify(req, res, next) {
    try {
      const { userId, code, type } = req.body;
      const tokens = await UserService.verify({ userId, code, type });
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const tokens = await UserService.login({ email, password });
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/refresh
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await UserService.refresh(refreshToken);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/change-password
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.sub;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.changePassword(userId, oldPassword, newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
