
import express from 'express';
import passport from 'passport';
import AuthController from './auth.controller.js';
import { litmitRate } from '../../middlewares/litmitRate.js';
import checkPermission from '../../middlewares/permission.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

// POST /login - Endpoint đăng nhập người dùng với bảo vệ giới hạn tốc độ
router.post('/login', litmitRate, AuthController.login);
// POST /register - Endpoint đăng ký người dùng với bảo vệ giới hạn tốc độ
router.post('/register', litmitRate, AuthController.register);
// POST /forgot-password - Endpoint để khởi tạo quá trình đặt lại mật khẩu
router.post('/forgot-password', AuthController.forgotPassword);
// POST /reset-password - Endpoint để hoàn tất đặt lại mật khẩu với mật khẩu mới
router.post('/reset-password', AuthController.resetPassword);
// POST /send-verify-code - Endpoint để gửi mã xác minh email cho người dùng
router.post('/send-verify-code', AuthController.sendCodeToVerifyEmail);
// POST /verify-email - Endpoint để xác minh email người dùng bằng mã xác minh
router.post('/verify-email', AuthController.verifyEmail);
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
	checkPermission('roles.update'),
	// Thực thi logic gán quyền
	AuthController.assignPermissions
);

// POST /permissions/revoke - Thu hồi các quyền cụ thể từ người dùng/vai trò
router.post(
	'/permissions/revoke',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền thu hồi quyền không
	checkPermission('permissions.revoke'),
	// Thực thi logic thu hồi quyền
	AuthController.revokePermissions
);

// GET /users/:userId/permissions - Lấy tất cả quyền cho một người dùng cụ thể
router.get(
	'/users/:userId/permissions',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem quyền không
	checkPermission('permissions.view'),
	// Thực thi logic lấy quyền người dùng
	AuthController.getUserPermissions
);

// GET /users/roles - Lấy người dùng được nhóm theo vai trò được gán
router.get(
	'/users/roles',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem quyền/vai trò không
	checkPermission('permissions.view'),
	// Thực thi logic lấy người dùng theo vai trò
	AuthController.getUsersByRole
);

// POST /roles/:userId/assign - Gán vai trò cho một người dùng cụ thể
router.post(
	'/roles/:userId/assign',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem/quản lý vai trò không
	checkPermission('roles.view'),
	// Thực thi logic gán vai trò
	AuthController.assignRoleToUser
);
// POST /roles/:userId/revoke - Loại bỏ vai trò khỏi một người dùng cụ thể
router.post(
	'/roles/:userId/revoke',
	// Xác minh người dùng đã được xác thực trước khi tiếp tục
	authMiddleware,
	// Kiểm tra xem người dùng có quyền xem/quản lý vai trò không
	checkPermission('roles.view'),
	// Thực thi logic thu hồi vai trò
	AuthController.revokeRoleFromUser
);
// Export router để sử dụng trong ứng dụng chính
export default router;
