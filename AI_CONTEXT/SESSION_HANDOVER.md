# SESSION HANDOVER

## Status at Handover

Project context đã được chuyển từ kiến trúc Google Apps Script + Google Sheets sang baseline kiến trúc mới:

```text
Next.js Full-stack
    ↓
Route Handler
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Tài liệu mới mô tả kiến trúc mục tiêu. Không được hiểu rằng toàn bộ code migration đã hoàn thành nếu chưa có verification thực tế.

## Current Overview Catalog Rule

Trang Tổng quan có hai danh sách độc lập:

- Danh sách lĩnh vực chỉ hiển thị tên lĩnh vực, không hiển thị số tour bên dưới.
- Chọn lĩnh vực để xem toàn bộ thương hiệu thuộc lĩnh vực đó, kể cả thương hiệu chưa có tour.
- Thương hiệu phải được liên kết trực tiếp với lĩnh vực bằng `ThuongHieu.linhVucId`; quan hệ qua tour chỉ dùng để tương thích dữ liệu cũ.

## Essential Product Rule

Một tour là duy nhất theo tổ hợp:

```text
Thương hiệu + Khu vực
```

Một tour:

- có một URL VR360 chung;
- có ít nhất một chi nhánh;
- có thể có nhiều chi nhánh;
- dùng chi nhánh để xác định phường/xã và phục vụ bộ lọc.

Chi nhánh không phải là tour riêng và không có link VR360 riêng trong MVP.

## New Runtime Boundary

### Development

```text
Browser
  ↓
Next.js localhost:3000
  ↓
Route Handler
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL Docker localhost:5432
```

### Security

- Không commit `.env` production.
- Không ghi database password/token/secret trong context.
- Prisma chỉ chạy server-side.
- Không đưa `DATABASE_URL` vào client bundle.

## Legacy Runtime To Retire Later

Sau khi migration mới chạy ổn định, các thành phần cũ sẽ không còn cần cho runtime chính:

- Google Sheets làm database.
- Google Apps Script CRUD API.
- `.gs` backend files.
- `SPREADSHEET_ID`.
- `GS_WEBAPP_URL`.
- Apps Script-specific request transport.

Không xóa dữ liệu hoặc backend cũ trước khi migration production được kiểm chứng.

## Latest Delta: Tour Form Field Order

- **Task completed:** Trong form `Thêm tour mới`/`Sửa tour`, dropdown `Lĩnh vực` hiện đứng trước dropdown `Thương hiệu`.
- **File changed:** `src/app/page.tsx`.
- **Decision:** Người dùng chọn lĩnh vực trước; sau đó danh sách thương hiệu được tải và lọc theo lĩnh vực đã chọn.
- **Verification:** `rg` xác nhận thứ tự JSX là `Lĩnh vực` → `Thương hiệu`; `npm run build` hoàn tất thành công.
- **Blocker:** Chưa có browser e2e tự động cho thứ tự hiển thị và thao tác chọn lĩnh vực.
- **Next step:** Mở form trên `http://localhost:3003`, chọn lĩnh vực và xác nhận dropdown thương hiệu được cập nhật tương ứng.
- **Regression risk:** Khi đổi lĩnh vực, thương hiệu đã chọn bị reset có chủ đích; cần giữ hành vi này để tránh gửi brand không thuộc lĩnh vực.

## Latest Delta: Tour List Filters And Verification

- **Task completed:** Bổ sung dropdown lọc tour theo thương hiệu và lĩnh vực trong `Danh sách tour`; sắp xếp cột `Lĩnh vực` trước `Thương hiệu`.
- **Files changed:** `src/app/page.tsx`, `src/app/api/tours/route.ts`, `src/services/tour.service.ts`, `src/repositories/tour.repository.ts`; đã cập nhật tài liệu yêu cầu và handover liên quan.
- **Decision:** Bộ lọc được truyền qua query params `thuongHieuId` và `linhVucId`, xử lý ở repository để lọc từ database; UI giữ các bộ lọc tìm kiếm, khu vực và trạng thái hiện có.
- **Verification:** Dev server phản hồi `200 OK` tại `http://localhost:3003/`; `/api/thuong-hieu` và `/api/tours` đều phản hồi `200 OK`; `npm run build` hoàn tất thành công.
- **Blocker:** Chưa có automated/e2e test xác nhận thao tác chọn dropdown trên trình duyệt; Prisma Client trên Windows từng bị khóa khi generate trong lúc server chạy, nên cần lưu ý khi regenerate.
- **Next step:** Dùng browser kiểm tra thao tác đổi từng dropdown và xác nhận danh sách reload đúng; sau đó bổ sung test cho filter và CRUD thương hiệu.
- **Regression risk:** Query filter mới có thể ảnh hưởng tải lại dữ liệu khi đổi menu; dữ liệu thương hiệu cũ không có `linhVucId` vẫn phụ thuộc fallback từ tour.

## Next Immediate Step

1. Kiểm tra end-to-end các dropdown lọc thương hiệu/lĩnh vực trên port `3003`.
2. Bổ sung automated tests cho filter, CRUD thương hiệu và dữ liệu thương hiệu chưa có tour.
3. Tiếp tục kiểm tra dependency delete và transaction rollback trước production.

## Coding Rule For AI

Khi thêm feature mới, AI phải làm theo thứ tự:

```text
READ
→ PLAN
→ DATABASE
→ SERVICE/REPOSITORY
→ API
→ UI
→ VERIFY
```

AI không được tự tạo architecture mới nếu project đã có convention tương đương.
