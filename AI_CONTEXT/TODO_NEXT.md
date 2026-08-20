# TODO NEXT

## Phase 1 - Freeze Legacy Business Rules

1. Giữ nguyên bản backup của project cũ.
2. Không xóa Google Sheets hoặc Apps Script nếu vẫn còn dữ liệu production.
3. Xác nhận bốn entity chính:
   - `KhuVuc`
   - `PhuongXa`
   - `Tour`
   - `ChiNhanh`
4. Xác nhận lại toàn bộ unique/dependency/delete rules trong `REQUIREMENTS.md`.

## Phase 2 - Prepare New Project Architecture

1. Dùng project Next.js hiện tại hoặc khởi tạo project mới theo convention của công ty.
2. Cài Prisma và PostgreSQL driver/adapter theo version đang dùng.
3. Tạo:

```text
prisma/
src/services/
src/repositories/
src/validations/
src/lib/
```

4. Tạo `.env.example`.
5. Đảm bảo `.env` nằm trong `.gitignore`.

## Phase 3 - Create PostgreSQL Docker

1. Tạo `compose.yaml` ở root project.
2. Tạo PostgreSQL service.
3. Khai báo local development credentials.
4. Chạy:

```bash
docker compose up -d
```

5. Kiểm tra container:

```bash
docker compose ps
```

6. Tạo `DATABASE_URL` local.

## Phase 4 - Design Prisma Schema

1. Tạo model `KhuVuc`.
2. Tạo model `PhuongXa`.
3. Tạo model `Tour`.
4. Tạo model `ChiNhanh`.
5. Tạo relation.
6. Chốt ID strategy.
7. Chốt status enum.
8. Chốt normalize fields/unique strategy.
9. Chốt cascade/restrict rules.
10. Review schema trước khi migrate.

## Phase 5 - Create First Migration

Sau khi schema được duyệt:

```bash
npx prisma migrate dev --name init
```

Sau đó generate Prisma Client theo version đang dùng.

Không sửa migration đầu tiên tùy tiện sau khi đã có môi trường dùng chung; nếu cần thay đổi, tạo migration mới.

## Phase 6 - Build Data Layer

Tạo:

```text
src/lib/prisma.ts

src/repositories/
├── khu-vuc.repository.ts
├── phuong-xa.repository.ts
├── tour.repository.ts
└── chi-nhanh.repository.ts
```

Repository chỉ tập trung data access.

## Phase 7 - Build Service Layer

Tạo:

```text
src/services/
├── khu-vuc.service.ts
├── phuong-xa.service.ts
├── tour.service.ts
└── stats.service.ts
```

Ưu tiên triển khai business rules trước UI.

Đặc biệt:

- unique khu vực;
- unique phường/xã trong khu vực;
- unique thương hiệu + khu vực;
- dependency khi xóa;
- ward phải thuộc cùng khu vực với tour;
- transaction khi tạo/sửa/xóa tour + branches.

## Phase 8 - Build API Layer

Tạo Next.js Route Handlers.

Không cần tạo Controller riêng ở MVP.

Route Handler phải mỏng:

```text
Request
 ↓
Validation
 ↓
Service
 ↓
Response
```

## Phase 9 - Migrate UI

Chuyển giao diện cũ sang Next.js theo từng màn hình:

1. Dashboard.
2. Danh sách tour.
3. Search/filter.
4. Form thêm/sửa tour + nhiều chi nhánh.
5. Quản lý khu vực/phường-xã.
6. Confirm delete.
7. Error/loading/empty states.

Không thay đổi business rule chỉ vì chuyển framework.

## Phase 10 - Data Migration If Needed

Nếu Google Sheets cũ có dữ liệu thật:

1. Export/backup dữ liệu nguồn.
2. Viết script import riêng.
3. Normalize dữ liệu.
4. Check duplicate.
5. Map ID/relation.
6. Import vào database staging/local trước.
7. So sánh số record và thống kê.
8. Chỉ import production sau khi verify.

## Latest Delta - Tour Form Order

- [x] Đưa dropdown `Lĩnh vực` đứng trước dropdown `Thương hiệu` trong form thêm/sửa tour.
- [x] Giữ logic tải thương hiệu theo lĩnh vực đã chọn.
- [x] Chạy `npm run build` sau thay đổi.
- [ ] Kiểm tra trực tiếp form bằng browser trên port `3003`.

## Latest Delta - Tour Filters

- [x] Thêm dropdown lọc theo thương hiệu trong `Danh sách tour`.
- [x] Thêm dropdown lọc theo lĩnh vực trong `Danh sách tour`.
- [x] Đưa cột `Lĩnh vực` đứng trước cột `Thương hiệu`.
- [x] Mở rộng API/service/repository với `thuongHieuId` và `linhVucId`.
- [x] Xác nhận `GET /`, `/api/thuong-hieu`, `/api/tours` trên port `3003` trả `200 OK`.
- [x] Xác nhận `npm run build` thành công.
- [ ] Kiểm tra thao tác đổi từng dropdown bằng browser e2e.

## Phase 11 - Verification

Bổ sung kiểm thử danh mục Tổng quan:

- Chọn từng lĩnh vực và xác nhận toàn bộ thương hiệu thuộc lĩnh vực xuất hiện.
- Xác nhận thương hiệu chưa gắn tour vẫn hiển thị.
- Xác nhận lĩnh vực không hiển thị dòng `0 tour` hoặc `1 tour` bên dưới tên.
- Tạo thương hiệu từ lĩnh vực đang chọn và kiểm tra thương hiệu xuất hiện sau refresh.
- Kiểm tra duplicate name và dependency khi xóa thương hiệu.

Bắt buộc test:

- CRUD KhuVuc.
- CRUD PhuongXa.
- CRUD Tour + ChiNhanh.
- Dependency delete.
- Unique rules.
- Transaction rollback.
- Search.
- Filter khu vực.
- Filter phường/xã.
- Filter trạng thái.
- Stats.
- Xem tour URL.
- UI giữ dữ liệu form khi API lỗi.
- TypeScript check.
- Production build.

## Phase 12 - Production

1. Chọn nơi deploy Next.js.
2. Chọn PostgreSQL production.
3. Cấu hình production `DATABASE_URL` trong secret manager/environment variables.
4. Chạy production migration bằng flow phù hợp.
5. Kiểm tra authentication/access control.
6. Chạy smoke test production.
7. Sau khi xác nhận dữ liệu và chức năng mới ổn định mới ngừng hệ thống Apps Script cũ.
