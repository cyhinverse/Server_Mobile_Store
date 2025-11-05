export const SYSTEM_PERMISSIONS = {
	// ==================== USER MANAGEMENT ====================
	USER_CREATE: 'users.create', // ✅ Enforced in user.route.js
	USER_READ: 'users.read', // ✅ Enforced in user.route.js
	USER_UPDATE: 'users.update', // ✅ Enforced in user.route.js
	USER_DELETE: 'users.delete', // ✅ Enforced in user.route.js

	// ==================== PRODUCT MANAGEMENT ====================
	PRODUCT_CREATE: 'products.create', // ✅ Enforced in product.route.js
	PRODUCT_READ: 'products.read', // Public routes, no enforcement needed
	PRODUCT_UPDATE: 'products.update', // ✅ Enforced in product.route.js
	PRODUCT_DELETE: 'products.delete', // ✅ Enforced in product.route.js

	// ==================== ORDER MANAGEMENT ====================
	ORDER_CREATE: 'orders.create', // User operation (authenticated only, no permission check)
	ORDER_READ: 'orders.read', // ✅ Enforced in order.route.js (admin routes)
	ORDER_UPDATE: 'orders.update', // ✅ Enforced in order.route.js
	ORDER_DELETE: 'orders.delete', // ✅ Enforced in order.route.js

	// ==================== CATEGORY MANAGEMENT ====================
	CATEGORY_CREATE: 'categories.create', // ✅ Enforced in category.route.js
	CATEGORY_READ: 'categories.read', // Public routes, no enforcement needed
	CATEGORY_UPDATE: 'categories.update', // ✅ Enforced in category.route.js
	CATEGORY_DELETE: 'categories.delete', // ✅ Enforced in category.route.js

	// ==================== BRAND MANAGEMENT ====================
	BRAND_CREATE: 'brands.create', // ✅ Enforced in brand.route.js
	BRAND_READ: 'brands.read', // Public routes, no enforcement needed
	BRAND_UPDATE: 'brands.update', // ✅ Enforced in brand.route.js
	BRAND_DELETE: 'brands.delete', // ✅ Enforced in brand.route.js

	// ==================== BANNER MANAGEMENT ====================
	BANNER_CREATE: 'banners.create', // ✅ Enforced in banner.route.js
	BANNER_READ: 'banners.read', // ✅ Enforced in banner.route.js
	BANNER_UPDATE: 'banners.update', // ✅ Enforced in banner.route.js
	BANNER_DELETE: 'banners.delete', // ✅ Enforced in banner.route.js

	// ==================== CART MANAGEMENT ====================
	CART_CREATE: 'carts.create', // User cart operations (authenticated only, no permission check)
	CART_READ: 'carts.read', // ✅ Enforced in cart.route.js (admin stats)
	CART_UPDATE: 'carts.update', // User cart operations (authenticated only, no permission check)
	CART_DELETE: 'carts.delete', // User cart operations (authenticated only, no permission check)

	// ==================== DISCOUNT MANAGEMENT ====================
	DISCOUNT_CREATE: 'discounts.create', // ✅ Enforced in discount.route.js
	DISCOUNT_READ: 'discounts.read', // ✅ Enforced in discount.route.js
	DISCOUNT_UPDATE: 'discounts.update', // ✅ Enforced in discount.route.js
	DISCOUNT_DELETE: 'discounts.delete', // ✅ Enforced in discount.route.js
	DISCOUNT_APPLY: 'discounts.apply', // User operation (authenticated only, no permission check)

	// ==================== NOTIFICATION MANAGEMENT ====================
	NOTIFICATION_CREATE: 'notifications.create', // ✅ Enforced in notification.route.js
	NOTIFICATION_READ: 'notifications.read', // ✅ Enforced in notification.route.js
	NOTIFICATION_UPDATE: 'notifications.update', // Not used (notifications are read-only after creation)
	NOTIFICATION_DELETE: 'notifications.delete', // ✅ Enforced in notification.route.js

	// ==================== REVIEW MANAGEMENT ====================
	REVIEW_CREATE: 'reviews.create', // User operation (authenticated only, no permission check)
	REVIEW_READ: 'reviews.read', // ✅ Enforced in review.route.js (admin routes)
	REVIEW_UPDATE: 'reviews.update', // User can update own reviews (authenticated only)
	REVIEW_DELETE: 'reviews.delete', // User can delete own reviews (authenticated only)
	REVIEW_MODERATE: 'reviews.moderate', // ⚠️ Deprecated - Use REVIEW_READ/UPDATE instead

	// ==================== WISHLIST MANAGEMENT ====================
	WISHLIST_CREATE: 'wishlist.create', // User operation (authenticated only, no permission check)
	WISHLIST_READ: 'wishlist.read', // ✅ Enforced in wishlist.route.js (admin routes)
	WISHLIST_UPDATE: 'wishlist.update', // User operation (authenticated only, no permission check)
	WISHLIST_DELETE: 'wishlist.delete', // User operation (authenticated only, no permission check)

	// ==================== PROMOTION MANAGEMENT ====================
	PROMOTION_CREATE: 'promotions.create', // ✅ Enforced in promotion.route.js
	PROMOTION_READ: 'promotions.read', // Public routes, no enforcement needed
	PROMOTION_UPDATE: 'promotions.update', // ✅ Enforced in promotion.route.js
	PROMOTION_DELETE: 'promotions.delete', // ✅ Enforced in promotion.route.js

	// ==================== ROLE & PERMISSION MANAGEMENT ====================
	ROLES_VIEW: 'roles.view', // Public route, no enforcement needed
	ROLES_UPDATE: 'roles.update', // ✅ Enforced in auth.route.js
	PERMISSIONS_VIEW: 'permissions.view', // ✅ Enforced in auth.route.js
	PERMISSIONS_REVOKE: 'permissions.revoke', // ✅ Enforced in auth.route.js
};

/**
 * PERMISSION GROUPS - For easier assignment to roles
 */

const USER_PERMISSIONS = [
	SYSTEM_PERMISSIONS.PRODUCT_READ,
	SYSTEM_PERMISSIONS.CATEGORY_READ,
	SYSTEM_PERMISSIONS.BRAND_READ,
	SYSTEM_PERMISSIONS.ORDER_CREATE,
	SYSTEM_PERMISSIONS.ORDER_READ,
	SYSTEM_PERMISSIONS.CART_CREATE,
	SYSTEM_PERMISSIONS.CART_READ,
	SYSTEM_PERMISSIONS.CART_UPDATE,
	SYSTEM_PERMISSIONS.CART_DELETE,
	SYSTEM_PERMISSIONS.REVIEW_CREATE,
	SYSTEM_PERMISSIONS.REVIEW_READ,
	SYSTEM_PERMISSIONS.REVIEW_UPDATE,
	SYSTEM_PERMISSIONS.REVIEW_DELETE,
	SYSTEM_PERMISSIONS.WISHLIST_CREATE,
	SYSTEM_PERMISSIONS.WISHLIST_READ,
	SYSTEM_PERMISSIONS.WISHLIST_UPDATE,
	SYSTEM_PERMISSIONS.WISHLIST_DELETE,
	SYSTEM_PERMISSIONS.NOTIFICATION_READ,
	SYSTEM_PERMISSIONS.DISCOUNT_READ,
	SYSTEM_PERMISSIONS.DISCOUNT_APPLY,
	SYSTEM_PERMISSIONS.PROMOTION_READ,
];

export const PERMISSION_GROUPS = {
	// Admin has all permissions
	ADMIN: Object.values(SYSTEM_PERMISSIONS),

	// User basic permissions (read-only + own data management)
	USER: USER_PERMISSIONS,
};

/**
 * ROLE DEFINITIONS
 * Only 'user' and 'admin' roles exist in the system
 */
export const SYSTEM_ROLES = {
	ADMIN: 'admin',
	USER: 'user',
};

/**
 * Helper function to check if a permission string matches a defined permission
 * Supports both dot notation (module.action) and colon notation (module:action)
 *
 * @param {string} permission - Permission string to check
 * @returns {boolean} - True if permission is valid
 */
export function isValidPermission(permission) {
	if (!permission || typeof permission !== 'string') {
		return false;
	}

	// Normalize permission format (convert colon to dot)
	const normalized = permission.replace(':', '.');

	// Check if it exists in SYSTEM_PERMISSIONS values
	const allPermissions = Object.values(SYSTEM_PERMISSIONS).map((p) =>
		p.replace(':', '.')
	);
	return allPermissions.includes(normalized);
}

/**
 * Validate an array of permissions
 * Checks if all permissions in the array are valid and defined in SYSTEM_PERMISSIONS
 *
 * @param {string[]} permissions - Array of permission strings to validate
 * @returns {Object} - { valid: boolean, invalid: string[] }
 */
export function validatePermissions(permissions) {
	if (!Array.isArray(permissions)) {
		return { valid: false, invalid: ['Input must be an array'] };
	}

	const invalid = permissions.filter((p) => !isValidPermission(p));

	return {
		valid: invalid.length === 0,
		invalid: invalid,
	};
}

/**
 * Get all permissions for a specific role
 *
 * @param {string} role - Role name (admin, user, seller)
 * @returns {string[]} - Array of permission strings
 */
export function getPermissionsByRole(role) {
	const roleUpper = role?.toUpperCase();
	return PERMISSION_GROUPS[roleUpper] || PERMISSION_GROUPS.USER;
}
