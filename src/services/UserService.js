const User = require('../models/User');
const OtpService = require('./OtpService');
const jwt = require('jsonwebtoken');

class UserService {
  // Register new user and send verification OTP
  static async register({ email, phone, password }, type = 'email') {
    // Create user
    const user = await User.create({ email, phone, password });

    // Generate OTP
    const otp = await OtpService.generateOtp(user._id, type);
    const destination = type === 'sms' ? user.phone : user.email;
    await OtpService.sendOtp(otp, destination);

    return { userId: user._id, message: `OTP sent to ${destination}` };
  }

  // Verify user OTP and issue JWT tokens
  static async verify({ userId, code, type = 'email' }) {
    await OtpService.verifyOtp(userId, code, type);

    // Mark user as verified
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    // Issue tokens
    const accessToken = jwt.sign(
      { sub: user._id, roles: user.roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { sub: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Authenticate via email/password
  static async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');
    if (!user.isVerified) throw new Error('User email not verified');

    // Issue tokens
    const accessToken = jwt.sign(
      { sub: user._id, roles: user.roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { sub: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Refresh tokens
  static async refresh(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.sub);
      if (!user) throw new Error('User not found');

      const newAccessToken = jwt.sign(
        { sub: user._id, roles: user.roles },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );
      const newRefreshToken = jwt.sign(
        { sub: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new Error('Old password is incorrect');
    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  // Find user by ID
  static getById(userId) {
    return User.findById(userId).select('-password');
  }
}

module.exports = UserService;