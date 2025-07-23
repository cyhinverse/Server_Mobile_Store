# Notification Module

Module quản lý thông báo cho ứng dụng Mobile Store.

## Tính năng

### 1. Quản lý thông báo cơ bản

- Tạo, đọc, cập nhật, xóa thông báo
- Phân loại thông báo theo type: `order`, `promotion`, `system`, `account`, `delivery`
- Hỗ trợ đa ngôn ngữ (Tiếng Việt và Tiếng Anh)
- Đánh dấu đã đọc/chưa đọc
- Soft delete thông báo

### 2. Thông báo theo ngữ cảnh

- **Thông báo đơn hàng**: Cập nhật trạng thái đơn hàng (xác nhận, giao hàng, hoàn thành, hủy)
- **Thông báo khuyến mãi**: Thông tin về các chương trình giảm giá, khuyến mãi
- **Thông báo hệ thống**: Bảo trì, cập nhật, thông báo quan trọng
- **Thông báo tài khoản**: Chào mừng, xác thực, bảo mật
- **Thông báo vận chuyển**: Cập nhật tình trạng giao hàng

### 3. Tính năng nâng cao

- Phân trang và lọc thông báo
- Thống kê thông báo (tổng số, chưa đọc, đã đọc)
- Thông báo hàng loạt cho nhiều user
- Thiết lập độ ưu tiên (high, medium, low)
- Tự động xóa thông báo hết hạn
- Metadata linh hoạt cho từng loại thông báo

## API Endpoints

### User APIs (Yêu cầu authentication)

#### Lấy thông báo của user

```
GET /api/v1/notifications/my-notifications
Query params:
- page: số trang (default: 1)
- limit: số thông báo mỗi trang (default: 20, max: 100)
- status: lọc theo trạng thái (unread, read, deleted)
- type: lọc theo loại (order, promotion, system, account, delivery)
- sort: sắp xếp (default: -createdAt)
```

#### Đếm thông báo chưa đọc

```
GET /api/v1/notifications/unread-count
```

#### Lấy thống kê thông báo

```
GET /api/v1/notifications/stats
```

#### Lấy chi tiết một thông báo

```
GET /api/v1/notifications/:id
```

#### Đánh dấu đã đọc một thông báo

```
PATCH /api/v1/notifications/:id/read
```

#### Đánh dấu tất cả thông báo đã đọc

```
PATCH /api/v1/notifications/mark-all-read
```

#### Xóa thông báo

```
DELETE /api/v1/notifications/:id
```

### Admin APIs (Yêu cầu quyền admin)

#### Tạo thông báo mới

```
POST /api/v1/notifications/
Body: {
  user: "userId",
  type: "order|promotion|system|account|delivery",
  title: {
    vi: "Tiêu đề tiếng Việt",
    en: "English title"
  },
  content: {
    vi: "Nội dung tiếng Việt",
    en: "English content"
  },
  metadata: {
    orderId: "orderId", // optional
    promotionId: "promotionId", // optional
    deepLink: "/link", // optional
    icon: "icon-name" // optional
  },
  priority: "high|medium|low", // optional, default: medium
  expiresAt: "2024-12-31T23:59:59Z", // optional
  imageUrl: "https://example.com/image.jpg" // optional
}
```

#### Tạo thông báo hệ thống cho nhiều user

```
POST /api/v1/notifications/system
Body: {
  userIds: ["userId1", "userId2"],
  title: {
    vi: "Tiêu đề tiếng Việt",
    en: "English title"
  },
  content: {
    vi: "Nội dung tiếng Việt",
    en: "English content"
  },
  metadata: { // optional
    deepLink: "/link",
    icon: "system"
  }
}
```

#### Lấy thông báo theo loại

```
GET /api/v1/notifications/type/:type
Query params: page, limit, sort
```

#### Dọn dẹp thông báo hết hạn

```
DELETE /api/v1/notifications/cleanup/expired
```

### Internal APIs (Cho các service khác sử dụng)

#### Tạo thông báo đơn hàng

```
POST /api/v1/notifications/internal/order
Body: {
  userId: "userId",
  orderId: "orderId",
  orderStatus: "confirmed|shipped|delivered|cancelled",
  orderData: {
    orderNumber: "ORD001",
    totalAmount: 1000000
  }
}
```

#### Tạo thông báo khuyến mãi

```
POST /api/v1/notifications/internal/promotion
Body: {
  userId: "userId",
  promotionId: "promotionId",
  promotionData: {
    title: "Tên khuyến mãi",
    discountValue: 20,
    endDate: "2024-12-31T23:59:59Z"
  }
}
```

## Cách sử dụng trong code

### Import helper

```javascript
import NotificationHelper from '../helpers/notification.helper.js';
```

### Gửi thông báo đơn hàng

```javascript
await NotificationHelper.sendOrderStatusNotification(
	userId,
	orderId,
	'confirmed',
	{ orderNumber: 'ORD001', totalAmount: 1000000 }
);
```

### Gửi thông báo khuyến mãi

```javascript
await NotificationHelper.sendPromotionNotification(userId, promotionId, {
	title: 'Sale 50%',
	discountValue: 50,
	endDate: new Date(),
});
```

### Gửi thông báo chào mừng

```javascript
await NotificationHelper.sendWelcomeNotification(userId, {
	fullName: 'Nguyễn Văn A',
});
```

## Cấu trúc Database

### Notification Schema

```javascript
{
  user: ObjectId, // ref: User
  type: String, // order, promotion, system, account, delivery
  title: {
    vi: String,
    en: String
  },
  content: {
    vi: String,
    en: String
  },
  metadata: {
    orderId: ObjectId, // ref: Order
    promotionId: ObjectId, // ref: Promotion
    deepLink: String,
    icon: String
  },
  status: String, // unread, read, deleted
  scheduledAt: Date,
  expiresAt: Date,
  priority: String, // high, medium, low
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Jobs/Cron Tasks

### Dọn dẹp thông báo hết hạn

- Chạy hàng ngày lúc 2:00 AM
- Xóa các thông báo đã quá hạn `expiresAt`

### Nhắc nhở giỏ hàng bỏ quên

- Chạy hàng ngày lúc 10:00 AM và 7:00 PM
- Gửi thông báo nhắc nhở cho user có sản phẩm trong giỏ hàng lâu rồi

## Khởi động Jobs

Thêm vào file khởi động server:

```javascript
import { startNotificationJobs } from './src/jobs/notification.job.js';

// Khởi động notification jobs
startNotificationJobs();
```

## Dependencies

Cần cài đặt:

```bash
npm install node-cron joi
```

## Lưu ý

1. Tất cả API user cần authentication middleware
2. API admin cần authorization middleware với role admin
3. Internal API không cần auth, chỉ dùng trong server
4. Validation được áp dụng cho tất cả endpoints
5. Hỗ trợ phân trang cho tất cả API list
6. Soft delete được sử dụng thay vì hard delete
7. Index được tạo để tối ưu performance truy vấn
