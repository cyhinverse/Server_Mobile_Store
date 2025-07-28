# Product Module Architecture

## Cấu trúc 3 tầng đã được tái thiết kế

### 1. **Repository Layer** (`product.repository.js`)

**Nhiệm vụ**: Chỉ xử lý truy cập database và các thao tác CRUD cơ bản

**Chức năng**:

- Kế thừa từ `BaseRepository` để có các method cơ bản (create, findById, update, delete, findAll)
- Thêm các method tùy chỉnh cho Product:
  - `findByCategory()` - Tìm sản phẩm theo category với pagination
  - `searchProducts()` - Tìm kiếm sản phẩm theo tên/mô tả
  - `filterProducts()` - Lọc sản phẩm theo nhiều tiêu chí
  - `findBySlug()` - Tìm sản phẩm theo slug
  - `getProductDetails()` - Lấy chi tiết sản phẩm với populate
  - `checkStock()` - Kiểm tra tồn kho
  - `updateStock()` - Cập nhật tồn kho

**Nguyên tắc**:

- Không chứa business logic
- Chỉ tương tác với database
- Return raw data từ database

### 2. **Service Layer** (`product.service.js`)

**Nhiệm vụ**: Xử lý business logic và gọi repository

**Chức năng**:

- Validate business rules (ví dụ: kiểm tra tên sản phẩm trùng lặp)
- Xử lý dữ liệu trước khi gửi xuống repository
- Implement các quy tắc nghiệp vụ:
  - Tự động set default values khi tạo sản phẩm
  - Validate pagination parameters
  - Clean và process search input
  - Validate price range trong filter
  - Convert string boolean thành boolean thực
- Orchestrate multiple repository calls nếu cần
- Transform data từ repository trước khi trả về controller

**Nguyên tắc**:

- Không biết về HTTP request/response
- Chứa toàn bộ business logic
- Gọi repository để thao tác với database
- Throw meaningful errors

### 3. **Controller Layer** (`product.controller.js`)

**Nhiệm vụ**: Chỉ xử lý HTTP request/response

**Chức năng**:

- Validate HTTP request parameters và body
- Parse query parameters (page, limit, etc.)
- Sử dụng Joi validation cho input
- Gọi service để xử lý business logic
- Handle errors và convert thành appropriate HTTP status codes
- Format response theo chuẩn API
- Không chứa business logic gì cả

**Nguyên tắc**:

- Chỉ biết về HTTP layer
- Delegate tất cả business logic cho service
- Handle HTTP errors appropriately
- Return formatted responses

## Lợi ích của kiến trúc mới

### 1. **Separation of Concerns**

- Mỗi layer có một nhiệm vụ rõ ràng
- Dễ maintain và debug
- Code dễ hiểu hơn

### 2. **Testability**

- Có thể test từng layer độc lập
- Mock dễ dàng giữa các layer
- Unit test cho business logic ở service layer

### 3. **Reusability**

- Service có thể được sử dụng bởi nhiều controller khác nhau
- Repository methods có thể được reuse
- Business logic centralized ở service layer

### 4. **Maintainability**

- Thay đổi database logic chỉ cần sửa repository
- Thay đổi business rules chỉ cần sửa service
- Thay đổi API format chỉ cần sửa controller

### 5. **Scalability**

- Dễ dàng thêm new features
- Dễ dàng refactor từng layer
- Có thể optimize performance ở từng layer

## Ví dụ Flow

```
HTTP Request → Controller → Service → Repository → Database
                   ↓           ↓          ↓
               Validate    Business   Database
               Request     Logic      Operations
                   ↓           ↓          ↓
               Format      Process    Return Raw
               Response    Data       Data
```

## Các nguyên tắc cần tuân thủ

### Repository Layer:

- ❌ Không validate business rules
- ❌ Không process/transform data
- ✅ Chỉ database operations
- ✅ Return raw data

### Service Layer:

- ❌ Không biết về HTTP
- ❌ Không format response
- ✅ Validate business rules
- ✅ Process data
- ✅ Throw meaningful errors

### Controller Layer:

- ❌ Không chứa business logic
- ❌ Không trực tiếp call database
- ✅ Validate HTTP input
- ✅ Handle HTTP errors
- ✅ Format response
