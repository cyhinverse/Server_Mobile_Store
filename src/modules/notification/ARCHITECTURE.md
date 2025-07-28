# Notification Module Architecture

## Overview

The Notification module follows a strict 3-tier architecture pattern with clear separation of concerns, providing a robust system for managing user notifications across the mobile store platform.

1. **Repository Layer** - Data access and database operations
2. **Service Layer** - Business logic and validation
3. **Controller Layer** - HTTP request/response handling

## Architecture Pattern

### Repository Layer (`notification.repository.js`)

**Responsibility**: Direct database access and data operations only

- Extends `BaseRepository` for common CRUD operations
- Contains notification-specific database queries
- No business logic or validation
- Pure data access methods

**Key Methods**:

- `findByUserId(userId, filter, options)` - Get user notifications with filtering
- `countUnreadByUserId(userId)` - Count unread notifications for user
- `markAsReadById(notificationId, userId)` - Mark single notification as read
- `markAllAsReadByUserId(userId)` - Mark all user notifications as read
- `softDeleteById(notificationId, userId)` - Soft delete notification
- `findByType(type, options)` - Get notifications by type with pagination
- `getStatsByUserId(userId)` - Get aggregated statistics for user
- `createMany(notifications)` - Bulk create notifications
- `deleteExpired()` - Remove expired notifications

### Service Layer (`notification.service.js`)

**Responsibility**: Business logic, validation, and data processing

- Contains all business rules and validation logic
- Orchestrates repository calls
- Handles data transformation and processing
- Real-time event emission
- Error handling with descriptive messages
- No direct database access (uses repository)

**Key Features**:

- **Notification Type Validation**: Validates against allowed types (order, promotion, system, account, delivery)
- **Priority Management**: Handles high/medium/low priority notifications
- **Multi-language Support**: Normalizes title/content for Vietnamese and English
- **Order Notifications**: Auto-generates content based on order status changes
- **Promotion Notifications**: Creates targeted promotional messages
- **System Notifications**: Bulk creation for multiple users
- **Real-time Events**: Emits events for WebSocket/Socket.io integration
- **Statistics**: Aggregates notification metrics

**Key Methods**:

- `getUserNotifications(userId, query)` - Get notifications with business logic
- `createNotification(data)` - Create with validation and events
- `createOrderNotification(userId, orderId, status, data)` - Order-specific notifications
- `createPromotionNotification(userId, promotionId, data)` - Promotion notifications
- `createSystemNotification(userIds, title, content)` - Bulk system notifications
- `getNotificationStats(userId)` - Business intelligence metrics

### Controller Layer (`notification.controller.js`)

**Responsibility**: HTTP request/response handling only

- Validates request parameters and body using Joi schemas
- Delegates all business logic to Service layer
- Formats HTTP responses consistently
- Error handling and status code management
- No business logic or database access

**Key Features**:

- Input validation using `NotificationValidation` schemas
- Consistent error response formatting
- Try-catch error handling with proper status codes
- Clean separation from business logic
- User authentication context handling

## Notification Types & Use Cases

### 1. Order Notifications

- **Confirmed**: Order received and confirmed
- **Shipped**: Order dispatched for delivery
- **Delivered**: Order successfully delivered
- **Cancelled**: Order cancelled by user or system

### 2. Promotion Notifications

- New promotions matching user preferences
- Limited-time offers
- Discount alerts
- Product-specific promotions

### 3. System Notifications

- Maintenance announcements
- Policy updates
- Feature releases
- General announcements

### 4. Account Notifications

- Login alerts
- Password changes
- Profile updates
- Security notifications

### 5. Delivery Notifications

- Shipping updates
- Delivery scheduling
- Address confirmations

## Data Flow

```
HTTP Request → Controller → Service → Repository → Database
                ↓           ↓          ↓
             Validation   Business   Data Access
                ↓        Logic        ↓
HTTP Response ← Format ← Processing ← Query Results
                         ↓
                    Real-time Events → WebSocket/Socket.io
```

## Features

### Multi-language Support

- Vietnamese (vi) and English (en) content
- Automatic normalization for single-language input
- Fallback to Vietnamese if English not provided

### Real-time Notifications

- WebSocket integration through event system
- Immediate notification delivery
- Connection management for online users

### Priority System

- **High**: Critical notifications (order status, security)
- **Medium**: Important updates (promotions, features)
- **Low**: General information (tips, suggestions)

### Scheduling & Expiration

- Schedule notifications for future delivery
- Automatic cleanup of expired notifications
- TTL-based notification management

### Statistics & Analytics

- User engagement metrics
- Read/unread ratios
- Type-based analytics
- Performance monitoring

## Database Schema

### Core Fields

- `user_id`: Reference to user receiving notification
- `type`: Notification category (order, promotion, etc.)
- `title`: Multi-language title object
- `content`: Multi-language content object
- `status`: unread/read/deleted
- `priority`: high/medium/low
- `scheduledAt`: When to send notification
- `expiresAt`: When notification expires

### Metadata Fields

- `orderId`: For order-related notifications
- `promotionId`: For promotion notifications
- `deepLink`: App navigation link
- `icon`: Display icon identifier

## Error Handling Strategy

### Repository Layer

- Database connection errors
- Query validation errors
- Data integrity issues

### Service Layer

- Business rule violations
- Invalid parameters
- Missing required data
- Event emission failures (non-blocking)

### Controller Layer

- HTTP validation errors
- Authentication/authorization failures
- Response formatting

## Performance Considerations

### Indexing Strategy

- `user_id + status + createdAt` for user queries
- `type + createdAt` for admin type filtering
- `expiresAt` for cleanup operations
- `scheduledAt` for scheduled notifications

### Pagination

- Maximum 100 items per request
- Efficient offset-based pagination
- Total count optimization

### Caching Strategy

- Unread count caching
- User notification preferences
- Frequently accessed notifications

## Security Features

### Access Control

- User-specific notification access
- Admin-only type filtering
- Internal API protection

### Data Validation

- Comprehensive Joi validation
- XSS prevention in content
- SQL injection protection

### Privacy

- Soft deletion for user privacy
- Automatic cleanup of expired data
- GDPR compliance considerations

## Usage Examples

### Creating Order Notification

```javascript
await NotificationService.createOrderNotification(
	userId,
	orderId,
	'confirmed',
	{ orderNumber: 'ORD-001', totalAmount: 299000 }
);
```

### Bulk System Notification

```javascript
await NotificationService.createSystemNotification(
	[userId1, userId2, userId3],
	'System Maintenance',
	'Scheduled maintenance on Sunday 2AM-4AM'
);
```

### Getting User Notifications

```javascript
const result = await NotificationService.getUserNotifications(userId, {
	page: 1,
	limit: 20,
	status: 'unread',
	type: 'order',
});
```

## File Structure

```
notification/
├── notification.model.js      # Mongoose schema
├── notification.repository.js # Data access layer
├── notification.service.js    # Business logic layer
├── notification.controller.js # HTTP handling layer
├── notification.route.js      # Route definitions
├── notification.validation.js # Joi validation schemas
├── ARCHITECTURE.md            # This documentation
└── README.md                  # Module overview
```

## Integration Points

### Event System

- Real-time notification delivery
- WebSocket connection management
- Event-driven architecture

### Email/SMS Integration

- External notification channels
- Template-based messaging
- Delivery confirmation

### Mobile Push Notifications

- FCM/APNs integration
- Device token management
- Platform-specific formatting

## Best Practices

1. **Keep controllers thin** - Only handle HTTP concerns
2. **Centralize business logic** - All rules in service layer
3. **Use event-driven architecture** - Decouple notification creation from delivery
4. **Implement proper caching** - Reduce database load for frequent queries
5. **Monitor performance** - Track notification delivery and read rates
6. **Handle failures gracefully** - Don't block main operations for notification failures
7. **Respect user preferences** - Allow users to control notification types
8. **Implement rate limiting** - Prevent notification spam
