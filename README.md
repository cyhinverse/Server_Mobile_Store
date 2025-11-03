# Mobile Store Backend API

Enterprise-grade RESTful API backend system for mobile phone e-commerce platform, built with Node.js, Express, and MongoDB.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Real-time Communication](#real-time-communication)
- [Background Processing](#background-processing)
- [Deployment](#deployment)

---

## Overview

Mobile Store Backend is a production-ready API system designed for e-commerce applications specializing in mobile device retail. The system implements industry-standard practices including layered architecture, comprehensive security measures, and scalable infrastructure.

### Key Capabilities

- Product catalog management with advanced filtering and search
- Secure authentication with JWT and OAuth 2.0 integration
- Real-time notification system using WebSocket technology
- Automated order processing and inventory management
- Payment gateway integration with transaction tracking
- Promotional campaign management with dynamic pricing
- Comprehensive user permission and role-based access control
- Cloud-based media storage and optimization
- Scheduled background jobs for system maintenance

---

## System Architecture

The application follows a three-tier architecture pattern with clear separation of concerns:

### Layered Architecture

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Controllers & Route Handlers)     │
├─────────────────────────────────────┤
│     Business Logic Layer            │
│        (Services)                   │
├─────────────────────────────────────┤
│     Data Access Layer               │
│      (Repositories)                 │
├─────────────────────────────────────┤
│     Database Layer                  │
│       (MongoDB)                     │
└─────────────────────────────────────┘
```

### Design Patterns Implemented

- **Repository Pattern**: Abstracts data access logic
- **Dependency Injection**: Loose coupling between components
- **Singleton Pattern**: Single instance for services and controllers
- **Factory Pattern**: Standardized response formatting
- **Observer Pattern**: Event-driven notification system
- **Middleware Pattern**: Request/response processing pipeline
- **Strategy Pattern**: Multiple authentication strategies

---

## Core Features

### Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- OAuth 2.0 integration with Google Sign-In
- Password reset via email verification
- Role-based access control (RBAC)
- Fine-grained permission system

### User Management

- Comprehensive user profile management
- Multi-address support for shipping
- Order history tracking
- Personal wishlist functionality
- Product review and rating system

### Product Catalog

- Full CRUD operations for product management
- Hierarchical category and subcategory structure
- Brand management and filtering
- Product variant support (color, storage capacity)
- Real-time inventory tracking
- Advanced search with multiple filters
- Dynamic price range filtering

### Shopping Experience

- Persistent shopping cart with session management
- Wishlist with cross-device synchronization
- User-generated reviews and ratings
- Personalized product recommendations

### Order Processing & Payment

- Complete order lifecycle management
- Multi-status order tracking
- Payment gateway integration
- Comprehensive order history
- Automated invoice generation

### Promotional System

- Flexible discount code management
- Percentage and fixed-amount discount support
- Time-bound promotional campaigns
- Product-specific discount rules
- Minimum order value enforcement

### Real-time Notification System

- WebSocket-based real-time updates
- Push notification delivery
- Order status change notifications
- Promotional alert broadcasting
- System-wide announcements

### Email Communication

- Automated welcome email on registration
- Order confirmation and tracking emails
- Password reset workflow
- Promotional campaign emails
- Abandoned cart recovery reminders

### Media Management

- Cloudinary CDN integration
- Automated image optimization
- Multi-image upload per product
- Responsive image delivery

### Administrative Dashboard

- Comprehensive analytics and statistics
- User account management
- Product catalog administration
- Order fulfillment management
- Banner and content management
- Business intelligence reports

---

## Technology Stack

### Runtime & Framework

- **Node.js** v20.x - High-performance JavaScript runtime
- **Express.js** v5.x - Fast, minimalist web framework
- **MongoDB** v8.x - Scalable NoSQL database
- **Mongoose** v8.x - MongoDB object modeling

### Security & Authentication

- **jsonwebtoken** - Secure JWT implementation
- **bcrypt** - Industry-standard password hashing
- **Passport.js** - Flexible authentication middleware
- **Helmet** - HTTP header security
- **express-rate-limit** - DDoS protection and rate limiting

### Real-time Infrastructure

- **Socket.IO** v4.x - Bidirectional event-based communication

### Storage & Media

- **Multer** - Multipart form data handling
- **Cloudinary** - Cloud-based media management

### Communication

- **Nodemailer** - SMTP email client

### Validation & Quality

- **Joi** - Schema-based validation

### Task Scheduling

- **node-cron** - Cron-based job scheduling

### Supporting Libraries

- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing
- **Compression** - Gzip compression middleware
- **Cookie-parser** - HTTP cookie parsing
- **Dotenv** - Environment configuration management

---

│ Service Layer │
│ (Business Logic & Validation) │
└─────────────────────────────────────┘
↓
┌─────────────────────────────────────┐

### Directory Structure

```
Server_Mobile_Store/
├── src/
│   ├── index.js                 # Application entry point
│   ├── configs/                 # System configuration
│   │   ├── catchAsync.js        # Async error wrapper
│   │   ├── config.cors.js       # CORS policy
│   │   ├── config.nodemailer.js # Email transport
│   │   ├── config.upload.js     # File upload settings
│   │   ├── passport.js          # Authentication strategies
│   │   └── permission.config.js # RBAC definitions
│   │
│   ├── core/                    # Base architectural components
│   │   ├── controller/
│   │   │   └── base.controller.js
│   │   ├── service/
│   │   │   └── base.service.js
│   │   └── repository/
│   │       └── base.repository.js
│   │
│   ├── db/
│   │   └── connect.mongodb.js   # Database connection pool
│   │
│   ├── events/                  # Event-driven handlers
│   │   └── notification.event.js
│   │
│   ├── helpers/
│   │   └── notification.helper.js
│   │
│   ├── jobs/                    # Scheduled background tasks
│   │   ├── notification.job.js
│   │   └── notification.job.complete.js
│   │
│   ├── middlewares/             # Request processing pipeline
│   │   ├── auth.js              # Authentication verification
│   │   ├── permission.js        # Authorization checks
│   │   ├── validation.js        # Schema validation
│   │   └── litmitRate.js        # Request throttling
│   │
│   ├── modules/                 # Domain-driven modules
│   │   ├── auth/                # Authentication
│   │   ├── user/                # User management
│   │   ├── product/             # Product catalog
│   │   ├── cart/                # Shopping cart
│   │   ├── order/               # Order processing
│   │   ├── payment/             # Payment gateway
│   │   ├── category/            # Product categories
│   │   ├── brand/               # Brand management
│   │   ├── discount/            # Discount system
│   │   ├── notification/        # Push notifications
│   │   ├── review/              # Product reviews
│   │   ├── wishlist/            # User wishlists
│   │   ├── banner/              # Banner ads
│   │   └── Promotion/           # Marketing campaigns
│   │
│   ├── routes/
│   │   └── index.js             # Centralized routing
│   │
│   ├── shared/                  # Cross-cutting concerns
│   │   ├── errors/              # Error handling
│   │   └── response/            # Response formatting
│   │       ├── responseFormatter.js
│   │       ├── responseTypes.js
│   │       └── pagination.js
│   │
│   ├── sockets/                 # WebSocket infrastructure
│   │   ├── index.js
│   │   └── notification.socket.js
│   │
│   └── utils/                   # Utility functions
│       ├── generateRandomCode.js
│       ├── password.util.js
│       └── token.js
│
├── .env                         # Environment configuration
├── package.json
├── Dockerfile
└── README.md
```

---

## Installation

### System Requirements

- **Node.js** >= 20.x
- **MongoDB** >= 8.x
- **npm** or **yarn** package manager
- **Cloudinary** account for media storage
- **Gmail** account with app password for SMTP

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/cyhinverse/Server_Mobile_Store.git
cd Server_Mobile_Store
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (recommended for production)
```

5. **Start the application**

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

Server will be accessible at: `http://localhost:5050` (or configured PORT)

---

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=5050
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Token Secrets
ACCESS_TOKEN_SECRET=your_secure_access_token_secret_here
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret_here
RESET_TOKEN_SECRET=your_secure_reset_token_secret_here

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Client Application URL
CLIENT_URL=http://localhost:3000

# Security
CODE_EXPIRATION_TIME=3600000  # 1 hour in milliseconds
```

### CORS Configuration

File: `src/configs/config.cors.js`

```javascript
export const configCors = {
	origin: process.env.CLIENT_URL || 'http://localhost:3000',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5050/api/v1
```

### API Modules

#### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint           | Description                 | Auth Required |
| ------ | ------------------ | --------------------------- | ------------- |
| POST   | `/register`        | User registration           | No            |
| POST   | `/login`           | User authentication         | No            |
| POST   | `/logout`          | Session termination         | Yes           |
| POST   | `/refresh-token`   | Token renewal               | Yes           |
| POST   | `/forgot-password` | Password reset request      | No            |
| POST   | `/reset-password`  | Password reset confirmation | No            |
| POST   | `/verify-email`    | Email verification          | No            |
| GET    | `/google`          | Google OAuth authentication | No            |

**Example: User Registration**

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phoneNumber": "0123456789",
  "dayOfBirth": "1990-01-01"
}
```

**Response:**

```json
{
	"status": "success",
	"message": "User registered successfully",
	"data": {
		"fullName": "John Doe",
		"email": "john@example.com",
		"phoneNumber": "0123456789",
		"roles": ["user"],
		"permissions": []
	},
	"meta": {}
}
```

---

#### User Management (`/api/v1/users`)

| Method | Endpoint           | Description              | Auth Required | Permission |
| ------ | ------------------ | ------------------------ | ------------- | ---------- |
| GET    | `/`                | Retrieve user list       | Yes           | admin      |
| GET    | `/profile`         | Get current user profile | Yes           | user       |
| PUT    | `/profile`         | Update user profile      | Yes           | user       |
| DELETE | `/:id`             | Delete user account      | Yes           | admin      |
| PUT    | `/:id/role`        | Modify user role         | Yes           | admin      |
| PUT    | `/:id/permissions` | Assign user permissions  | Yes           | admin      |

---

#### Product Catalog (`/api/v1/products`)

| Method | Endpoint                | Description         | Auth Required | Permission |
| ------ | ----------------------- | ------------------- | ------------- | ---------- |
| GET    | `/`                     | List all products   | No            | -          |
| GET    | `/:id`                  | Get product details | No            | -          |
| POST   | `/`                     | Create new product  | Yes           | admin      |
| PUT    | `/:id`                  | Update product      | Yes           | admin      |
| DELETE | `/:id`                  | Delete product      | Yes           | admin      |
| GET    | `/category/:categoryId` | Filter by category  | No            | -          |
| GET    | `/brand/:brandId`       | Filter by brand     | No            | -          |
| GET    | `/search`               | Product search      | No            | -          |

**Example: Product Listing**

```bash
GET /api/v1/products?page=1&limit=10&sort=-createdAt
```

**Response:**

```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "673e123...",
        "name": "iPhone 15 Pro Max",
        "price": 29990000,
        "stock": 50,
        "category_id": {...},
        "brand_id": {...},
        "images": [...],
        "specifications": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

#### Shopping Cart (`/api/v1/cart`)

| Method | Endpoint             | Description            | Auth Required |
| ------ | -------------------- | ---------------------- | ------------- |
| GET    | `/`                  | Retrieve cart contents | Yes           |
| POST   | `/add`               | Add item to cart       | Yes           |
| PUT    | `/update`            | Update item quantity   | Yes           |
| DELETE | `/remove/:productId` | Remove item from cart  | Yes           |
| DELETE | `/clear`             | Clear entire cart      | Yes           |

---

#### Order Management (`/api/v1/orders`)

| Method | Endpoint      | Description         | Auth Required | Permission |
| ------ | ------------- | ------------------- | ------------- | ---------- |
| GET    | `/`           | Retrieve all orders | Yes           | admin      |
| GET    | `/my-orders`  | Get user's orders   | Yes           | user       |
| GET    | `/:id`        | Get order details   | Yes           | user       |
| POST   | `/`           | Create new order    | Yes           | user       |
| PUT    | `/:id/status` | Update order status | Yes           | admin      |
| DELETE | `/:id`        | Cancel order        | Yes           | user       |

**Order Status Workflow:**

```
pending → confirmed → processing → shipping → delivered
                              ↓
                          cancelled
```

---

#### Notification System (`/api/v1/notifications`)

| Method | Endpoint        | Description            | Auth Required | Permission |
| ------ | --------------- | ---------------------- | ------------- | ---------- |
| GET    | `/`             | Retrieve notifications | Yes           | user       |
| GET    | `/unread-count` | Get unread count       | Yes           | user       |
| POST   | `/`             | Create notification    | Yes           | admin      |
| PUT    | `/:id/read`     | Mark as read           | Yes           | user       |
| PUT    | `/read-all`     | Mark all as read       | Yes           | user       |
| DELETE | `/:id`          | Delete notification    | Yes           | user       |

**Notification Types:**

- `system` - System announcements
- `order` - Order-related updates
- `promotion` - Promotional campaigns
- `account` - Account activities
- `delivery` - Shipment tracking

---

#### Discount Management (`/api/v1/discounts`)

| Method | Endpoint | Description             | Auth Required | Permission |
| ------ | -------- | ----------------------- | ------------- | ---------- |
| GET    | `/`      | List discount codes     | No            | -          |
| GET    | `/:code` | Validate discount code  | Yes           | user       |
| POST   | `/`      | Create discount code    | Yes           | admin      |
| PUT    | `/:id`   | Update discount code    | Yes           | admin      |
| DELETE | `/:id`   | Delete discount code    | Yes           | admin      |
| POST   | `/apply` | Apply discount to order | Yes           | user       |

---

#### Product Reviews (`/api/v1/reviews`)

| Method | Endpoint              | Description         | Auth Required |
| ------ | --------------------- | ------------------- | ------------- |
| GET    | `/product/:productId` | Get product reviews | No            |
| POST   | `/`                   | Submit review       | Yes           |
| PUT    | `/:id`                | Update review       | Yes           |
| DELETE | `/:id`                | Delete review       | Yes           |

---

### API Response Format

All API responses follow the JSend specification:

**Success Response:**

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {...},
  "meta": {
    "pagination": {...},
    "timestamp": "2025-11-04T01:30:00.000Z"
  }
}
```

**Fail Response (Client Error):**

```json
{
	"status": "fail",
	"message": "Validation failed",
	"errorCode": "VALIDATION_ERROR",
	"errors": ["Email is required", "Password must be at least 8 characters"]
}
```

**Error Response (Server Error):**

```json
{
	"status": "error",
	"message": "Internal server error",
	"code": 500
}
```

---

## Database Schema

### User Model

```javascript
{
  fullName: String (required),
  email: String (required, unique, indexed),
  password: String (required, bcrypt hashed),
  phoneNumber: String (required, unique),
  dayOfBirth: Date,
  avatar: String (Cloudinary URL),
  address: [{
    street: String,
    city: String,
    district: String,
    ward: String,
    isDefault: Boolean
  }],
  roles: [String], // ['user', 'admin', 'seller']
  permissions: [String],
  isEmailVerified: Boolean,
  codeVerify: String,
  codeVerifyExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  name: String (required, indexed),
  slug: String (unique, indexed),
  description: String,
  price: Number (required, min: 0),
  salePrice: Number,
  stock: Number (default: 0),
  sold: Number (default: 0),
  category_id: ObjectId (ref: Category, indexed),
  brand_id: ObjectId (ref: Brand, indexed),
  images: [String],
  specifications: {
    screen: String,
    os: String,
    camera: String,
    chip: String,
    ram: String,
    storage: String,
    battery: String
  },
  variants: [{
    color: String,
    storage: String,
    price: Number,
    stock: Number
  }],
  rating: Number (default: 0, min: 0, max: 5),
  reviewCount: Number (default: 0),
  isNewProduct: Boolean,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  user_id: ObjectId (ref: User, indexed),
  orderNumber: String (unique, auto-generated),
  items: [{
    product_id: ObjectId (ref: Product),
    quantity: Number (min: 1),
    price: Number,
    variant: Object
  }],
  totalAmount: Number (required),
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String (enum: ['pending', 'paid', 'failed']),
  orderStatus: String (enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled']),
  discount: {
    code: String,
    amount: Number
  },
  notes: String,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Notification Model

```javascript
{
  user_id: ObjectId (ref: User, indexed),
  type: String (enum: ['system', 'order', 'promotion', 'account', 'delivery']),
  title: String | Object (i18n support),
  content: String | Object (i18n support),
  metadata: Object,
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['unread', 'read', 'deleted'], indexed),
  imageUrl: String,
  scheduledAt: Date,
  expiresAt: Date (TTL index),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

---

## Authentication & Security

### JWT Token System

The system implements a dual-token authentication mechanism:

- **Access Token**: 1-hour validity for API authentication
- **Refresh Token**: 15-day validity for token renewal

**Authentication Flow:**

```
1. User authenticates → Server issues access token + refresh token
2. Client stores tokens securely (httpOnly cookies recommended)
3. API requests include access token in Authorization header:
   Authorization: Bearer <access_token>
4. On access token expiry → Use refresh token to obtain new access token
```

**Token Security:**

- Tokens signed with HS256 algorithm
- Secrets stored in environment variables
- Refresh token rotation on use
- Token blacklisting for logout functionality

### Role-Based Access Control (RBAC)

**System Roles:**

- `user` - Standard customer account
- `admin` - Administrative privileges
- `seller` - Merchant account privileges

**Permission Levels:**

- `read` - View operations
- `write` - Create operations
- `update` - Modification operations
- `delete` - Deletion operations
- `admin` - Full system access

**Middleware Implementation:**

```javascript
// Admin-only endpoint
router.post(
	'/products',
	authMiddleware,
	checkPermission(['admin']),
	createProduct
);

// Multi-role access
router.get(
	'/orders/my-orders',
	authMiddleware,
	checkPermission(['user', 'admin']),
	getMyOrders
);
```

### OAuth 2.0 Integration

Google OAuth 2.0 implementation using Passport.js:

```javascript
// Configuration
passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: '/api/v1/auth/google/callback',
		},
		verifyCallback
	)
);
```

---

## Real-time Communication

### Socket.IO Architecture

Real-time notification delivery via WebSocket protocol with polling fallback.

**Client Connection:**

```javascript
- User-specific room isolation
- Automatic reconnection with exponential backoff
- Connection state management
- Event acknowledgment system

**Message Flow:**
```

Order Created → Database Write → Event Emission → Socket Broadcast → Client Reception

````

---

## Background Processing

### Scheduled Task Management

The system utilizes `node-cron` for automated background tasks:

#### Task Schedule

**1. Expired Notification Cleanup**
- **Schedule**: Daily at 2:00 AM UTC
- **Function**: Removes notifications past their expiration date
```javascript
cron.schedule('0 2 * * *', cleanupExpiredNotifications);
````

**2. Abandoned Cart Recovery**

- **Schedule**: Daily at 10:00 AM and 7:00 PM
- **Function**: Sends email reminders for abandoned shopping carts

```javascript
cron.schedule('0 10,19 * * *', sendAbandonedCartReminder);
```

**3. Low Stock Alerts**

- **Schedule**: Every 6 hours
- **Function**: Notifies administrators of low inventory levels

```javascript
cron.schedule('0 */6 * * *', checkStockLevels);
```

**4. Promotion Expiration Management**

- **Schedule**: Daily at midnight
- **Function**: Deactivates expired promotional campaigns

```javascript
cron.schedule('0 0 * * *', checkExpiredPromotions);
```

---

## Performance & Optimization

### Caching Strategy

- HTTP response compression via `compression` middleware
- Static asset caching with appropriate cache headers
- MongoDB query optimization with compound indexes
- Lazy loading for large datasets

### Database Indexing

```javascript
// Frequently queried fields
User: email, phoneNumber;
Product: slug, category_id, brand_id, name;
Order: user_id, orderStatus, createdAt;
Notification: user_id, status, createdAt;
```

### Security Implementation

- **Rate Limiting**: Configurable request throttling per IP
- **Header Security**: Helmet.js HTTP header protection
- **Input Validation**: Joi schema validation on all endpoints
- **XSS Protection**: Output sanitization and escaping
- **NoSQL Injection Prevention**: Mongoose query sanitization
- **Password Security**: bcrypt with salt rounds of 10

### Monitoring & Logging

- Request logging with Morgan (combined format)
- Error tracking with stack traces
- Performance metrics collection
- API response time monitoring

---

## Docker Deployment

### Containerization

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose application port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5050/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application
CMD ["node", "src/index.js"]
```

**Build and Run:**

```bash
# Build image
docker build -t mobile-store-backend:latest .

# Run container
docker run -d \
  -p 5050:5050 \
  --env-file .env \
  --name mobile-store-api \
  mobile-store-backend:latest
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '5050:5050'
    env_file:
      - .env
    depends_on:
      - mongodb
  mongodb:
    image: mongo:8
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
volumes:
  mongodb_data:
```

---

## Deployment

### Production Configuration Checklist

- Configure `NODE_ENV=production`
- Generate cryptographically secure JWT secrets (32+ characters)
- Whitelist specific origins in CORS configuration
- Enable HTTPS/TLS with valid certificates
- Use MongoDB Atlas or managed database service
- Configure production Cloudinary account
- Set up transactional email service (SendGrid/AWS SES)
- Implement rate limiting (recommended: 100 requests/15 minutes)
- Configure centralized logging (Winston, Loggly, Papertrail)
- Set up automated database backups
- Deploy process manager (PM2, Kubernetes)

### Recommended Infrastructure

**Application Hosting:**

- AWS Elastic Beanstalk / EC2
- Google Cloud Run / Compute Engine
- DigitalOcean App Platform / Droplets
- Heroku (Hobby tier minimum)
- Railway.app

**Database:**

- MongoDB Atlas (M10+ for production)
- AWS DocumentDB
- Self-hosted MongoDB with replica sets

**CDN & Storage:**

- Cloudinary (Media management)
- AWS S3 + CloudFront
- Google Cloud Storage

**Email Service:**

- SendGrid
- AWS SES
- Mailgun
- Postmark

### Environment-Specific Configuration

**Development:**

```env
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT=1000
```

**Production:**

```env
NODE_ENV=production
LOG_LEVEL=error
RATE_LIMIT=100
ENABLE_MONITORING=true
```

---

## Development Roadmap

### Planned Features

**Phase 1 (Q1 2025):**

- Payment gateway integration (Stripe, VNPay, Momo)
- SMS notification service (Twilio)
- Advanced product filtering with faceted search

**Phase 2 (Q2 2025):**

- AI-powered product recommendations
- Comprehensive analytics dashboard
- Multi-language internationalization (i18n)

**Phase 3 (Q3 2025):**

- Elasticsearch integration for full-text search
- GraphQL API layer
- Microservices decomposition

**Phase 4 (Q4 2025):**

- Machine learning inventory forecasting
- Kubernetes orchestration
- Progressive Web App (PWA) support

---

## License

This project is licensed under the ISC License.

---

## Contact & Support

**Project Maintainer**: [GitHub Profile](https://github.com/cyhinverse)

**Technical Documentation**: Refer to inline code comments and module-specific README files

**Issue Tracking**: Submit bug reports and feature requests via GitHub Issues

---

**Built with Node.js, Express, and MongoDB** 3. Implement changes with clear, commented code 4. Write/update tests for new functionality 5. Ensure all tests pass: `npm test` 6. Commit with conventional commit messages: `git commit -m 'feat: add payment gateway'` 7. Push to your fork: `git push origin feature/descriptive-name` 8. Submit a Pull Request with detailed description

### Code Standards

- Follow ESLint configuration
- Maintain test coverage above 80%
- Document all public APIs
- Use meaningful variable and function names

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Cyhin**

- GitHub: [@cyhinverse](https://github.com/cyhinverse)
- Email: cyhin2508@gmail.com

---

## 🙏 Acknowledgments

- Node.js community
- Express.js team
- MongoDB team
- Socket.IO team
- All open-source contributors

---

## 📞 Support

Nếu bạn cần hỗ trợ hoặc có câu hỏi, vui lòng:

- Tạo issue trên GitHub
- Email: cyhin2508@gmail.com

---

**⭐ Nếu bạn thấy project hữu ích, hãy cho một star!**

---

_Last updated: November 4, 2025_
