import express from 'express';
import passport from 'passport';
import AuthController from './auth.controller.js';
import { litmitRate } from '../../middlewares/litmitRate.js';
import checkPermission from '../../middlewares/permission.js';
import authMiddleware from '../../middlewares/auth.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// POST /login - Endpoint đăng nhập người dùng với bảo vệ giới hạn tốc độ
router.post('/login', litmitRate, AuthController.login);
// POST /register - Endpoint đăng ký người dùng với bảo vệ giới hạn tốc độ
router.post('/register', litmitRate, AuthController.register);
// POST /forgot-password - Endpoint để khởi tạo quá trình đặt lại mật khẩu
router.post('/forgot-password', AuthController.forgotPassword);
// POST /reset-password - Endpoint để hoàn tất đặt lại mật khẩu với mật khẩu mới
router.post('/reset-password', AuthController.resetPassword);
// POST /change-password - Endpoint để đổi mật khẩu (yêu cầu xác thực)
router.post('/change-password', authMiddleware, AuthController.changePassword);
// POST /send-verify-code - Endpoint để gửi mã xác minh email cho người dùng
router.post('/send-verify-code', AuthController.sendCodeToVerifyEmail);
// POST /verify-email - Endpoint để xác minh email người dùng bằng mã xác minh
router.post('/verify-email', AuthController.verifyEmail);
// POST /resend-verification-code - Endpoint để gửi lại mã xác minh (yêu cầu xác thực)
router.post(
	'/resend-verification-code',
	authMiddleware,
	AuthController.resendVerificationCode
);
// POST /2fa/qr-generate - Endpoint để tạo mã QR cho xác thực 2 bước (yêu cầu xác thực)
router.post('/2fa/qr-generate', authMiddleware, AuthController.generateQRCode);
// POST /2fa/qr-verify - Endpoint để xác minh mã QR cho xác thực 2 bước (yêu cầu xác thực)
router.post('/2fa/qr-verify', authMiddleware, AuthController.verifyQRCode);
// GET /auth/google - Khởi tạo luồng xác thực Google OAuth
router.get(
	'/auth/google',
	// Sử dụng chiến lược Google Passport với quyền truy cập profile và email
	passport.authenticate('google', { scope: ['profile', 'email'] })
);
// GET /auth/google/callback - Xử lý callback Google OAuth sau khi người dùng ủy quyền
router.get(
	'/auth/google/callback',
	// Xử lý phản hồi xác thực Google, chuyển hướng đến /login khi thất bại
	passport.authenticate('google', { failureRedirect: '/login' }),
	// Thực thi phương thức controller đăng nhập Google khi xác thực thành công
	AuthController.loginWithGoogle
);
// GET /logout - Endpoint đăng xuất người dùng để vô hiệu hóa session/token
router.get('/logout', AuthController.logout);
// GET /roles - Lấy tất cả các vai trò có sẵn trong hệ thống
router.get('/roles', AuthController.getAllRoles);

// POST /roles/:id/permissions - Gán quyền cho một vai trò cụ thể
router.post(
	'/roles/:id/permissions',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền cập nhật vai trò không
	checkPermission([SYSTEM_PERMISSIONS.ROLES_UPDATE]),
	// Thực thi logic gán quyền
	AuthController.assignPermissions
);

// POST /permissions/revoke - Thu hồi các quyền cụ thể từ người dùng/vai trò
router.post(
	'/permissions/revoke',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền thu hồi quyền không
	checkPermission([SYSTEM_PERMISSIONS.PERMISSIONS_REVOKE]),
	// Thực thi logic thu hồi quyền
	AuthController.revokePermissions
);

// GET /users/roles - Lấy người dùng được nhóm theo vai trò (đặt trước để tránh conflict với :userId)
router.get(
	'/users/roles',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem quyền/vai trò không
	checkPermission([SYSTEM_PERMISSIONS.PERMISSIONS_VIEW]),
	// Thực thi logic lấy người dùng theo vai trò
	AuthController.getUsersByRole
);

// GET /users/:userId/permissions - Lấy tất cả quyền cho một người dùng cụ thể
router.get(
	'/users/:userId/permissions',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem quyền không
	checkPermission([SYSTEM_PERMISSIONS.PERMISSIONS_VIEW]),
	// Thực thi logic lấy quyền người dùng
	AuthController.getUserPermissions
);

// POST /roles/:userId/assign - Gán vai trò cho một người dùng cụ thể
router.post(
	'/roles/:userId/assign',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem/quản lý vai trò không
	checkPermission([SYSTEM_PERMISSIONS.ROLES_UPDATE]),
	// Thực thi logic gán vai trò
	AuthController.assignRoleToUser
);
// POST /roles/:userId/revoke - Loại bỏ vai trò khỏi một người dùng cụ thể
router.post(
	'/roles/:userId/revoke',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem/quản lý vai trò không
	checkPermission([SYSTEM_PERMISSIONS.ROLES_UPDATE]),
	// Thực thi logic thu hồi vai trò
	AuthController.revokeRoleFromUser
);
// Export router để sử dụng trong ứng dụng chính
export default router;
