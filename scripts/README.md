# Scripts Directory

Thư mục này chứa các script tiện ích và test cho Mobile Store Backend.

## Files Description

### Test Scripts

- **`comprehensive_api_test.js`** - Script test toàn diện cho tất cả API endpoints

  - Test Product APIs (CRUD, search, featured, etc.)
  - Test User APIs (CRUD, address management, etc.)
  - Test Category và Brand APIs
  - Tự động cleanup sau khi test
  - Kiểm tra tất cả 14+ endpoints

- **`simple_test.js`** - Script test đơn giản cho các API cơ bản
  - Test kết nối database
  - Test basic CRUD operations
  - Test nhanh các chức năng core

## Usage

### Chạy comprehensive test:

```bash
cd scripts
node comprehensive_api_test.js
```

### Chạy simple test:

```bash
cd scripts
node simple_test.js
```

## Prerequisites

- Server phải đang chạy trên port 5050
- Database MongoDB đã được kết nối
- Có dữ liệu mẫu trong database (products, users, categories, brands)

## Notes

- Các script test sẽ tự động cleanup dữ liệu test
- Backup database trước khi chạy test nếu làm việc với production data
- Scripts được thiết kế để test trên development environment
