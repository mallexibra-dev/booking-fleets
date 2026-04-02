const authService = require('../services/auth.service');
const { success: SuccessResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Login endpoint
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return SuccessResponse(res, 200, 'Login successful', result);
  });

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return SuccessResponse(res, 400, 'Refresh token is required');
    }

    const result = await authService.refreshToken(refreshToken);

    return SuccessResponse(res, 200, 'Token refreshed successfully', result);
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    // req.user is attached by authenticate middleware
    return SuccessResponse(res, 200, 'Profile retrieved successfully', req.user);
  });

  /**
   * Register new user (admin only)
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    return SuccessResponse(res, 201, 'User registered successfully', result);
  });

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return SuccessResponse(res, 200, result.message);
  });

  /**
   * Logout endpoint (optional - can be used for token blacklisting in future)
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // In a stateless JWT setup, logout is typically handled client-side
    // by deleting the token. For server-side logout, you'd need token blacklisting.
    return SuccessResponse(res, 200, 'Logged out successfully');
  });
}

module.exports = new AuthController();
