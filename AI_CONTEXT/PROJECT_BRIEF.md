# PROJECT BRIEF

## Product

**APP Quản Lý Tour VR360 Nhà Hàng** là ứng dụng nội bộ dùng để quản lý tập trung các tour VR360 của thương hiệu nhà hàng theo khu vực tại tỉnh Bắc Ninh.

## Problem

Dữ liệu tour cần được quản lý theo khu vực, phường/xã và chi nhánh. Một thương hiệu chỉ có một tour VR360 cho mỗi khu vực, nhưng tour đó có thể bao gồm nhiều chi nhánh tại các phường/xã khác nhau. Người dùng cần tra cứu nhanh link tour, biết phạm vi chi nhánh của từng tour, tìm kiếm/lọc dữ liệu và xem thống kê trạng thái tour.

## Intended Outcome

Người dùng có thể:

- Quản lý khu vực và phường/xã.
- Quản lý tour theo thương hiệu và khu vực.
- Quản lý nhiều chi nhánh thuộc một tour.
- Tìm kiếm, lọc và thống kê dữ liệu.
- Mở đúng URL VR360 của tour.
- Dữ liệu được lưu trong PostgreSQL và truy cập thông qua Prisma ở phía server của ứng dụng Next.js.

## User

- Một người dùng nội bộ: chủ dự án.
- Ứng dụng không phục vụ du khách hoặc người dân.
- Thiết bị sử dụng chính: desktop/laptop.

## New Technical Direction

Kiến trúc mới là **Next.js full-stack + TypeScript + Prisma + PostgreSQL**.

- Frontend và backend nằm trong cùng một project Next.js.
- Next.js App Router chịu trách nhiệm UI và Route Handlers.
- Route Handler đóng vai trò tương đương Controller ở tầng HTTP.
- Service xử lý business logic.
- Repository thực hiện truy vấn dữ liệu thông qua Prisma.
- Prisma là database access layer.
- PostgreSQL là database thật.
- Môi trường development chạy PostgreSQL bằng Docker Compose.

Luồng chuẩn:

```text
Browser / UI
    ↓
Next.js Route Handler
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

## MVP Scope

- Quản lý khu vực và phường/xã theo khu vực.
- Quản lý tour VR360 theo thương hiệu và khu vực.
- Quản lý nhiều chi nhánh trong một tour.
- Tìm kiếm, lọc và thống kê tour cơ bản.
- Mở link VR360 từ ứng dụng.

## Explicitly Out of Scope

- Trang công khai cho du khách.
- Phân quyền nhiều vai trò.
- Audit log hoặc lịch sử thao tác.
- Nhúng/trình chiếu tour trong ứng dụng.
- Link tour riêng theo chi nhánh.
- Kiểm tra tự động URL VR360 còn hoạt động.
- Xuất dữ liệu.
- Tạo QR code.
- Backup/restore từ giao diện.
- Quản lý danh mục lĩnh vực và thương hiệu độc lập với tour; thương hiệu có thể tồn tại trước khi được gắn vào tour.

## Constraints

- Quy mô dự kiến dưới 100 tour trong giai đoạn đầu.
- Không lưu mật khẩu, token, secret hoặc production database URL trong tài liệu hoặc repository công khai.
- UI hiển thị tiếng Việt, ưu tiên desktop nhưng vẫn phải dùng được trên màn hình nhỏ.
