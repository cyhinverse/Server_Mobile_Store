# Promotion Module Architecture

## Overview

The Promotion module follows a strict 3-tier architecture pattern with clear separation of concerns:

1. **Repository Layer** - Data access and database operations
2. **Service Layer** - Business logic and validation
3. **Controller Layer** - HTTP request/response handling

## Architecture Pattern

### Repository Layer (`promotion.repository.js`)

**Responsibility**: Direct database access and data operations only

- Extends `BaseRepository` for common CRUD operations
- Contains promotion-specific database queries
- No business logic or validation
- Pure data access methods

**Key Methods**:

- `findByTitle(title)` - Find promotion by title
- `findAllWithFilter(filter, options)` - Get promotions with filtering
- `findActivePromotions()` - Get currently active promotions
- `findExpiringPromotions(days)` - Get promotions expiring soon
- `findByProductId(productId)` - Get promotions for specific product
- `findUpcomingPromotions()` - Get promotions starting in the future

### Service Layer (`promotion.service.js`)

**Responsibility**: Business logic, validation, and data processing

- Contains all business rules and validation logic
- Orchestrates repository calls
- Handles data transformation and processing
- Error handling with descriptive messages
- No direct database access (uses repository)

**Key Features**:

- Date validation (start/end dates, active periods)
- Discount validation (percentage vs amount)
- Duplicate title checking
- Product relationship management
- Status management logic
- Pagination and filtering logic

**Key Methods**:

- `createPromotion(data)` - Create new promotion with validation
- `getAllPromotions(query)` - Get promotions with filtering/pagination
- `updatePromotion(id, data)` - Update with business validation
- `togglePromotionStatus(id)` - Activate/deactivate promotions
- `addProductsToPromotion(id, productIds)` - Manage product relationships

### Controller Layer (`promotion.controller.js`)

**Responsibility**: HTTP request/response handling only

- Validates request parameters and body using Joi schemas
- Delegates all business logic to Service layer
- Formats HTTP responses consistently
- Error handling and status code management
- No business logic or database access

**Key Features**:

- Input validation using `PromotionValidation` schemas
- Consistent error response formatting
- Try-catch error handling
- Proper HTTP status codes
- Clean separation from business logic

## Benefits of This Architecture

### 1. Separation of Concerns

- Each layer has a single, well-defined responsibility
- Changes in one layer don't affect others
- Code is more maintainable and readable

### 2. Testability

- Each layer can be tested independently
- Business logic in Service layer is easily unit testable
- Repository layer can be mocked for service tests

### 3. Reusability

- Repository methods can be reused across different services
- Service methods can be called from different controllers or contexts
- BaseRepository provides common functionality

### 4. Maintainability

- Easy to locate and modify specific functionality
- Clear code organization
- Consistent patterns across the application

### 5. Scalability

- Easy to add new features following the same pattern
- Database changes isolated to repository layer
- Business logic changes isolated to service layer

## Data Flow

```
HTTP Request → Controller → Service → Repository → Database
                ↓           ↓          ↓
             Validation   Business   Data Access
                ↓        Logic        ↓
HTTP Response ← Format ← Processing ← Query Results
```

## Usage Examples

### Creating a Promotion

1. **Controller**: Validates request data
2. **Service**: Checks business rules (dates, duplicates)
3. **Repository**: Saves to database
4. **Response**: Formatted success/error response

### Getting Promotions with Filters

1. **Controller**: Validates query parameters
2. **Service**: Processes filters and pagination logic
3. **Repository**: Executes filtered database query
4. **Response**: Returns formatted data with pagination info

## Error Handling

- **Repository**: Throws database-specific errors
- **Service**: Catches and transforms to business errors with meaningful messages
- **Controller**: Catches service errors and formats HTTP responses

## Best Practices

1. Keep controllers thin - only handle HTTP concerns
2. Put all business logic in services
3. Repository methods should be focused and single-purpose
4. Use consistent error handling patterns
5. Validate input at the controller level
6. Use descriptive error messages
7. Follow consistent naming conventions

## File Structure

```
promotion/
├── promotion.model.js      # Mongoose schema
├── promotion.repository.js # Data access layer
├── promotion.service.js    # Business logic layer
├── promotion.controller.js # HTTP handling layer
├── promotion.route.js      # Route definitions
├── promotion.validation.js # Joi validation schemas
└── ARCHITECTURE.md         # This documentation
```
