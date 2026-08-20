# DECISIONS LOG

## D-001: Product Access Model

**Decision:** Ứng dụng phục vụ một người dùng nội bộ là chủ dự án.

**Reason:** Chủ dự án là người trực tiếp cập nhật và sử dụng dữ liệu; MVP chưa cần phân quyền nhiều vai trò.

---

## D-002: Application Architecture

**Decision:** Chuyển sang một project Next.js full-stack thay vì frontend tĩnh + Google Apps Script backend riêng.

**Reason:** Giảm số project phải quản lý, dùng chung TypeScript, đơn giản hóa luồng phát triển và phù hợp quy mô ứng dụng nội bộ.

---

## D-003: Database Platform

**Decision:** PostgreSQL là nơi lưu dữ liệu chính.

**Reason:** Thay thế Google Sheets bằng relational database để có relation, unique constraint, transaction và khả năng mở rộng tốt hơn.

---

## D-004: Database Access Layer

**Decision:** Prisma là ORM/database access layer.

**Reason:** Prisma cung cấp typed query, relation mapping, migration và kết nối trực tiếp giữa server code TypeScript với PostgreSQL.

---

## D-005: Development Database Runtime

**Decision:** PostgreSQL chạy trong Docker Compose khi development; Next.js chạy trực tiếp bằng Node.js trên máy dev.

**Reason:** Database dễ khởi tạo/reset, trong khi Next.js vẫn dễ debug và hot reload mà không cần Docker hóa toàn bộ app.

---

## D-006: HTTP Controller Strategy

**Decision:** Không tạo thư mục Controller riêng ở MVP. Next.js Route Handler đóng vai trò HTTP Controller.

**Reason:** Tránh thêm một tầng trung gian không cần thiết. Business logic được tách sang Service và truy vấn dữ liệu được tách sang Repository.

Luồng chuẩn:

```text
Route Handler → Service → Repository → Prisma → PostgreSQL
```

---

## D-007: Business Logic Placement

**Decision:** Business rule không đặt trong UI và không đặt trực tiếp trong repository.

**Reason:** Service là tầng chịu trách nhiệm điều phối nghiệp vụ, dependency rule và transaction.

---

## D-008: Repository Layer

**Decision:** Tạo repository cho các module dữ liệu chính.

**Reason:** Giữ Prisma query tập trung, giảm coupling giữa business logic và ORM, giúp code dễ review và thay đổi.

---

## D-009: Tour Granularity

**Decision:** Một tour đại diện cho đúng một tổ hợp thương hiệu + khu vực; chi nhánh là dữ liệu con của tour.

**Reason:** Một URL VR360 có thể bao gồm nhiều chi nhánh, còn chi nhánh được dùng để lọc theo phường/xã.

---

## D-010: Data Integrity

**Decision:** Entity liên kết bằng ID ổn định; unique/dependency rule được thực thi ở Service và database constraint khi khả thi.

**Reason:** Tránh lỗi liên kết khi đổi tên và hạn chế dữ liệu trùng hoặc không hợp lệ.

---

## D-011: Tour Transaction

**Decision:** Tạo, cập nhật hoặc xóa tour cùng chi nhánh phải dùng transaction.

**Reason:** Không được để xảy ra trạng thái tour đã thay đổi nhưng chi nhánh chỉ cập nhật một phần.

---

## D-012: Frontend Direction

**Decision:** UI chuyển sang React/Next.js, giao diện tiếng Việt, font Roboto, màu cam và ưu tiên desktop.

**Reason:** Đồng bộ frontend với kiến trúc full-stack mới và vẫn giữ yêu cầu giao diện đã chốt.

---

## D-013: Tour Viewing

**Decision:** Ứng dụng chỉ mở URL VR360; không nhúng tour vào app.

**Reason:** Không có yêu cầu viewer nội bộ và tránh tăng coupling với nền tảng tour.

---

## D-014: Identifier Strategy

**Decision:** Không còn phụ thuộc ID có tiền tố `KV-`, `PX-`, `TOUR-`, `CN-` như khi dùng Google Sheets.

**Reason:** PostgreSQL + Prisma có thể tạo primary key ổn định tự động. Kiểu ID cụ thể (`cuid`, `uuid`, hoặc strategy khác) phải được chốt trong `schema.prisma` trước migration đầu tiên.

---

## D-015: API Contract

**Decision:** Các Route Handler trả response JSON nhất quán theo cấu trúc `{ ok, data, message, error }`.

**Reason:** Giữ frontend handling đơn giản và có một contract chung giữa UI với server layer.

---

## D-016: Mock Mode

**Decision:** Mock mode không còn là runtime chính của kiến trúc mới.

**Reason:** Development có PostgreSQL Docker cục bộ nên có thể chạy end-to-end với database thật ngay từ đầu. Mock chỉ dùng cho unit test hoặc UI isolation khi thật sự cần.

---

## D-017: Production Database Deployment

**Decision:** Chưa khóa provider production PostgreSQL.

**Reason:** Cần chọn sau giữa managed PostgreSQL hoặc PostgreSQL tự host. Không ghi credential production vào context.

---

## D-018: Independent Catalogs In Overview

**Decision:** Tổng quan quản lý lĩnh vực và thương hiệu như các danh mục độc lập với tour.

**Reason:** Thương hiệu chưa có tour vẫn phải hiển thị khi chọn lĩnh vực. Quan hệ `ThuongHieu.linhVucId` là nguồn chính; dữ liệu tour cũ chỉ dùng để tương thích/backfill khi cần.

**UI rule:** Danh sách lĩnh vực chỉ hiển thị tên lĩnh vực, không hiển thị số tour bên dưới. Danh sách thương hiệu hiển thị toàn bộ thương hiệu thuộc lĩnh vực đang chọn.
