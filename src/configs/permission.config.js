export const SYSTEM_PERMISSIONS = {
	// ==================== USER MANAGEMENT ====================
	USER_CREATE: 'users.create',
	USER_READ: 'users.read',
	USER_UPDATE: 'users.update',
	USER_DELETE: 'users.delete',

	// ==================== PRODUCT MANAGEMENT ====================
	PRODUCT_CREATE: 'products.create', // Also used as: 'product:create'
	PRODUCT_READ: 'products.read', // Also used as: 'product:read'
	PRODUCT_UPDATE: 'products.update', // Also used as: 'product:update'
	PRODUCT_DELETE: 'products.delete', // Also used as: 'product:delete'

	// ==================== ORDER MANAGEMENT ====================
	ORDER_CREATE: 'orders.create',
	ORDER_READ: 'orders.read',
	ORDER_UPDATE: 'orders.update',
	ORDER_DELETE: 'orders.delete',

	// ==================== CATEGORY MANAGEMENT ====================
	CATEGORY_CREATE: 'categories.create', // Currently NOT enforced in routes
	CATEGORY_READ: 'categories.read', // Currently NOT enforced in routes
	CATEGORY_UPDATE: 'categories.update', // Currently NOT enforced in routes
	CATEGORY_DELETE: 'categories.delete', // Currently NOT enforced in routes

	// ==================== BRAND MANAGEMENT ====================
	BRAND_CREATE: 'brands.create', // Currently NOT enforced in routes
	BRAND_READ: 'brands.read', // Currently NOT enforced in routes
	BRAND_UPDATE: 'brands.update', // Currently NOT enforced in routes
	BRAND_DELETE: 'brands.delete', // Currently NOT enforced in routes

	// ==================== BANNER MANAGEMENT ====================
	BANNER_CREATE: 'banner:create', // Used in banner.route.js
	BANNER_READ: 'banner:read', // Used in banner.route.js
	BANNER_UPDATE: 'banner:update', // Used in banner.route.js
	BANNER_DELETE: 'banner:delete', // Used in banner.route.js

	// ==================== CART MANAGEMENT ====================
	CART_CREATE: 'cart:create', // User cart operations (no permission required, authenticated only)
	CART_READ: 'cart:read', // Admin: stats, pagination, abandoned carts
	CART_UPDATE: 'cart:update', // User cart operations (no permission required, authenticated only)
	CART_DELETE: 'cart:delete', // User cart operations (no permission required, authenticated only)

	// ==================== DISCOUNT MANAGEMENT ====================
	DISCOUNT_CREATE: 'discounts.create', // Currently NOT enforced in routes
	DISCOUNT_READ: 'discounts.read', // Currently NOT enforced in routes
	DISCOUNT_UPDATE: 'discounts.update', // Currently NOT enforced in routes
	DISCOUNT_DELETE: 'discounts.delete', // Currently NOT enforced in routes
	DISCOUNT_APPLY: 'discounts.apply', // Currently NOT enforced in routes

	// ==================== NOTIFICATION MANAGEMENT ====================
	NOTIFICATION_CREATE: 'notifications.create', // Admin: create notifications, system notifications
	NOTIFICATION_READ: 'notifications.read', // Admin: get by type
	NOTIFICATION_UPDATE: 'notifications.update', // Currently NOT enforced in routes
	NOTIFICATION_DELETE: 'notifications.delete', // Admin: cleanup expired notifications

	// ==================== REVIEW MANAGEMENT ====================
	REVIEW_CREATE: 'reviews.create', // Currently NOT enforced in routes
	REVIEW_READ: 'reviews.read', // Currently NOT enforced in routes
	REVIEW_UPDATE: 'reviews.update', // Currently NOT enforced in routes
	REVIEW_DELETE: 'reviews.delete', // Currently NOT enforced in routes
	REVIEW_MODERATE: 'reviews.moderate', // For admin review management

	// ==================== WISHLIST MANAGEMENT ====================
	WISHLIST_CREATE: 'wishlists.create', // Currently NOT enforced in routes
	WISHLIST_READ: 'wishlists.read', // Currently uses ['admin'] role check
	WISHLIST_UPDATE: 'wishlists.update', // Currently NOT enforced in routes
	WISHLIST_DELETE: 'wishlists.delete', // Currently NOT enforced in routes

	// ==================== PROMOTION MANAGEMENT ====================
	PROMOTION_CREATE: 'promotions.create', // Currently NOT enforced in routes
	PROMOTION_READ: 'promotions.read', // Currently NOT enforced in routes
	PROMOTION_UPDATE: 'promotions.update', // Currently NOT enforced in routes
	PROMOTION_DELETE: 'promotions.delete', // Currently NOT enforced in routes

	// ==================== ROLE & PERMISSION MANAGEMENT ====================
	ROLES_VIEW: 'roles.view', // Used in auth.route.js
	ROLES_UPDATE: 'roles.update', // Used in auth.route.js
	PERMISSIONS_VIEW: 'permissions.view', // Used in auth.route.js
	PERMISSIONS_REVOKE: 'permissions.revoke', // Used in auth.route.js
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

const SELLER_PERMISSIONS = [
	...USER_PERMISSIONS,
	SYSTEM_PERMISSIONS.PRODUCT_CREATE,
	SYSTEM_PERMISSIONS.PRODUCT_UPDATE,
	SYSTEM_PERMISSIONS.ORDER_UPDATE,
	SYSTEM_PERMISSIONS.DISCOUNT_CREATE,
	SYSTEM_PERMISSIONS.DISCOUNT_UPDATE,
	SYSTEM_PERMISSIONS.DISCOUNT_DELETE,
	SYSTEM_PERMISSIONS.PROMOTION_CREATE,
	SYSTEM_PERMISSIONS.PROMOTION_UPDATE,
	SYSTEM_PERMISSIONS.PROMOTION_DELETE,
];

export const PERMISSION_GROUPS = {
	// Admin has all permissions
	ADMIN: Object.values(SYSTEM_PERMISSIONS),

	// User basic permissions
	USER: USER_PERMISSIONS,

	// Seller/Manager permissions
	SELLER: SELLER_PERMISSIONS,
};

/**
 * ROLE DEFINITIONS
 */
export const SYSTEM_ROLES = {
	ADMIN: 'admin',
	USER: 'user',
	SELLER: 'seller',
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
