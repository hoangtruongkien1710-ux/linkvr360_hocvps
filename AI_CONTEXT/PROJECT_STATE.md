# PROJECT_STATE.md

## Current Phase

Dự án đã hoàn thành nền tảng database và API cơ bản của kiến trúc mới và sẵn sàng triển khai data layer:

```text
Next.js Full-stack
       ↓
Service
       ↓
Repository
       ↓
Prisma
       ↓
PostgreSQL
```

## Completed

- Tạo project package Node.js/Next.js tối thiểu.
- Cài Next.js, React, TypeScript và Prisma.
- Tạo `compose.yaml` cho PostgreSQL development.
- PostgreSQL Docker đang chạy với port host `5433`.
- Tạo `.env` local với `DATABASE_URL` trỏ tới `localhost:5433`.
- Tạo `prisma/schema.prisma`.
- Schema đã được `prisma validate` xác nhận hợp lệ.
- Tạo và áp dụng migration đầu tiên: `prisma/migrations/20260819053636_init/`.
- Generate Prisma Client thành công, đang dùng Prisma `6.19.3`.
- Tour hỗ trợ nhiều lĩnh vực qua enum `TourType`.
- URL VR360 có unique constraint toàn hệ thống, vì mỗi URL chỉ được dùng cho một tour và các khu vực khác nhau không được trùng URL.
- Repository layer cho KhuVuc, PhuongXa, Tour.
- Service layer với validation, unique, dependency, transaction rules.
- Route Handlers cho KhuVuc, PhuongXa, Tours, Stats.
- UI quản lý tour, khu vực, phường/xã.

## Database Models

- `KhuVuc`
- `PhuongXa`
- `Tour`
- `ChiNhanh`

## Important Business Rules

- Một tour đại diện cho một thương hiệu tại một khu vực.
- Một tour thuộc một lĩnh vực (`RESTAURANT`, `HOTEL`, `CAFE`, `SPA`, `BOAT`, `OTHER`).
- Một tour có một URL VR360 chung.
- URL VR360 là duy nhất trên toàn hệ thống.
- Một tour có ít nhất một chi nhánh; chi nhánh không có URL riêng.
- Chi nhánh phải thuộc phường/xã trong cùng khu vực với tour; rule này sẽ được thực thi ở Service layer.
- Tạo/cập nhật/xóa tour và chi nhánh phải dùng transaction.
- Không xóa khu vực/phường-xã khi còn dependency.

## Not Yet Implemented

- Prisma Client wrapper tại `src/lib/prisma.ts`.
- Seed data.
- Automated tests và test end-to-end đầy đủ.
- Authentication production.
- Production deployment.

## Verification Status

- PASS: PostgreSQL Docker container đang chạy (`5433:5432`).
- PASS: Kết nối Prisma tới database `tour360`.
- PASS: `npx prisma validate`.
- PASS: migration đầu tiên đã áp dụng.
- PASS: `npx prisma generate`.
- PASS: Route Handler CRUD.
- PASS: service/repository rules.
- PASS: Next.js API integration.
- PASS: UI quản lý tour và danh mục khu vực/phường-xã.
- NOT RUN: production deployment.

## Legacy Components To Remove Or Replace

Sau khi migration hoàn tất, các thành phần sau không còn là runtime chính:

- Google Sheets database.
- Google Apps Script CRUD backend.
- `backend/*.gs`.
- `SPREADSHEET_ID`.
- `GS_WEBAPP_URL`.
- `USE_MOCK` làm chế độ chạy mặc định.

Không xóa code cũ trước khi dữ liệu và chức năng mới được verify đầy đủ.

## Latest Deployment Delta

- **Task completed:** Đã tạo `Dockerfile` production multi-stage, `nginx/nginx.conf` reverse proxy và `.dockerignore`.
- **Files changed:** `Dockerfile`, `nginx/nginx.conf`, `.dockerignore`, `next.config.ts`.
- **Decision:** Bật Next.js `output: 'standalone'`; runtime container chạy dưới user không phải root trên port `3000`; Nginx proxy tới service `app:3000`. Cấu hình hiện chạy HTTP, chưa nhúng certificate.
- **Blocker:** Chưa có `compose.production.yaml`, domain, TLS certificate và secret production; chưa build image Docker trên VPS.
- **Next step:** Tạo Compose production có `db`, `migrate`, `app`, Nginx; cấu hình secret ngoài git, healthcheck, migration deploy và HTTPS.
- **Regression risk:** Dockerfile giả định project có `public/`; Nginx giả định Compose service tên `app`; cần giữ đúng tên service hoặc sửa upstream khi tạo Compose.

## Latest Feature Delta

- Form thêm/sửa tour đã được sắp xếp theo luồng: chọn `Lĩnh vực` trước, sau đó chọn `Thương hiệu`.
- Khi đổi lĩnh vực, danh sách thương hiệu được tải lại theo lĩnh vực và lựa chọn thương hiệu cũ được xóa.

- Đã bổ sung bộ lọc dropdown theo `ThuongHieu` và `LinhVuc` trong màn hình `Danh sách tour`.
- Đã sắp xếp cột `Lĩnh vực` đứng trước `Thương hiệu`.
- API `GET /api/tours` nhận `thuongHieuId` và `linhVucId`; repository áp dụng hai điều kiện lọc ở database.
- Danh mục thương hiệu độc lập với tour đã hoạt động; thương hiệu chưa có tour vẫn được trả về và hiển thị theo lĩnh vực.
- Dev server hiện chạy tại `http://localhost:3003`.

## Latest Verification

- PASS: `GET /` trên port `3003` trả `200 OK`.
- PASS: `GET /api/thuong-hieu` trả `200 OK` và trả cả thương hiệu chưa có tour.
- PASS: `GET /api/tours` trả `200 OK`.
- PASS: `npm run build` hoàn tất: compile, TypeScript và static generation đều thành công.

## Known Blocker

- Chưa chạy browser e2e để xác nhận trực tiếp thao tác đổi hai dropdown.
- Trên Windows, `prisma generate` có thể gặp `EPERM` nếu dev server đang khóa Prisma engine; cần dừng server trước khi generate lại.

## Next Step

Triển khai seed data, kiểm tra end-to-end bộ lọc và CRUD thương hiệu, sau đó hoàn thiện kiểm thử production.
