/**
 * Internal API Key Middleware
 * Protects internal routes from external access
 * Only allows requests with valid internal API key or from localhost
 */

import { AppError } from '../shared/errors/AppError.js';

// Generate a random internal API key for development
// In production, use environment variable
const INTERNAL_API_KEY =
	process.env.INTERNAL_API_KEY ||
	'internal-secret-key-' + Math.random().toString(36);

// Log the key in development for testing
if (process.env.NODE_ENV !== 'production') {
	console.log('🔑 Internal API Key:', INTERNAL_API_KEY);
}

/**
 * Middleware to check internal API key
 * Allows requests with valid API key header or from localhost
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const internalApiKeyMiddleware = (req, res, next) => {
	// Allow localhost/127.0.0.1 in development
	const clientIp = req.ip || req.connection.remoteAddress;
	const isLocalhost =
		clientIp === '::1' ||
		clientIp === '127.0.0.1' ||
		clientIp === '::ffff:127.0.0.1' ||
		clientIp === 'localhost';

	if (process.env.NODE_ENV !== 'production' && isLocalhost) {
		return next();
	}

	// Check for internal API key in header
	const apiKey = req.headers['x-internal-api-key'] || req.headers['x-api-key'];

	if (!apiKey) {
		throw new AppError(
			401,
			'UNAUTHORIZED: Internal API key required',
			'Missing x-internal-api-key header'
		);
	}

	if (apiKey !== INTERNAL_API_KEY) {
		throw new AppError(
			403,
			'FORBIDDEN: Invalid internal API key',
			'Invalid internal API key provided'
		);
	}

	// Valid API key, proceed
	next();
};

export default internalApiKeyMiddleware;
