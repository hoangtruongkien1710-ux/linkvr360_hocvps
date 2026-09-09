# Changelog

Ghi lại thay đổi theo từng phiên bản. Định dạng phiên bản: `vMAJOR.MINOR.PATCH`
(PATCH = sửa lỗi, MINOR = thêm tính năng tương thích, MAJOR = thay đổi phá vỡ tương thích).

## [Chưa phát hành]

## [1.1.0] - 2026-09-09

### Thêm
- Số điện thoại cho từng chi nhánh (`ChiNhanh.soDienThoai`) — ô nhập trong form thêm/sửa tour, có kiểm tra định dạng cơ bản; tìm kiếm tour cũng quét theo số điện thoại.
- `CHANGELOG.md` và quy trình đánh tag phiên bản.
- Hiển thị số phiên bản đang chạy ở chân sidebar.
- `deploy.sh` nhận tham số phiên bản: `./deploy.sh v1.1.0` (tag) hoặc `./deploy.sh main` (nhánh).

### Thay đổi
- Giao diện trang Tổng quan và Khu vực & phường/xã: thêm icon cho thẻ thống kê, tiêu đề, trạng thái rỗng.
- Nút Sửa/Xóa đổi thành nút icon; nút "Mở tour" đổi thành nút pill có icon.
- Nới rộng modal form tour cho vừa 4 ô của mỗi dòng chi nhánh.

### Hạ tầng
- Ngừng theo dõi `next-env.d.ts` và `tsconfig.tsbuildinfo` (file tự sinh).

## [1.0.0] - 2026-09-09

### Thêm
- Quản lý Khu vực / Phường-xã, Lĩnh vực / Thương hiệu, Tour + nhiều Chi nhánh.
- Tìm kiếm, lọc theo khu vực / phường-xã / thương hiệu / lĩnh vực / trạng thái.
- Trang Tổng quan: tổng số tour, đang hoạt động, tạm ngưng; danh mục lĩnh vực – thương hiệu.
- Kiến trúc Next.js 16 (App Router) + Prisma + PostgreSQL, phân lớp route → service → repository.

### Hạ tầng
- Đóng gói Docker multi-stage (`output: standalone`), `compose.production.yaml`: db + migrate + app.
- Deploy lên VPS dùng chung qua cổng 8080 (không kèm nginx riêng).

[Chưa phát hành]: https://github.com/hoangtruongkien1710-ux/linkvr360_hocvps/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/hoangtruongkien1710-ux/linkvr360_hocvps/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/hoangtruongkien1710-ux/linkvr360_hocvps/releases/tag/v1.0.0
