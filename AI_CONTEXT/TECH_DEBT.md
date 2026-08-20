# TECH DEBT AND RISKS

## Known MVP Limitations

- Không có audit history.
- Không có undo hoặc in-app recovery.
- Không có multi-user role.
- Không có in-app backup/restore.
- URL VR360 chỉ validation định dạng cơ bản.
- Không tự kiểm tra URL tour còn truy cập được.
- Không có export hoặc QR code.
- Không có public visitor view.
- Brand master table đã được bổ sung với quan hệ trực tiếp `ThuongHieu.linhVucId`; dữ liệu cũ chưa backfill trực tiếp hoàn toàn nên còn dùng fallback từ tour khi cần.
- Chưa có automated/e2e test cho dropdown filter và luồng CRUD thương hiệu chưa có tour.

## Migration Risks

### 1. Business rule drift

Khi chuyển từ Apps Script sang Next.js/Prisma, dễ mất các rule phụ thuộc cũ nếu chỉ chuyển giao diện mà không chuyển validation/service logic.

**Mitigation:** Viết test hoặc checklist theo từng Acceptance Criteria trước khi bỏ backend cũ.

### 2. Partial update of Tour and Branches

Một tour có nhiều chi nhánh. Nếu cập nhật từng bảng độc lập có thể tạo dữ liệu nửa hoàn thành.

**Mitigation:** Dùng Prisma transaction cho create/update/delete liên quan nhiều record.

### 3. Unique normalization

Yêu cầu unique không phân biệt hoa/thường và khoảng trắng thừa không nên chỉ dựa vào raw string.

**Mitigation:** Chốt chiến lược normalize trước migration đầu tiên và bảo vệ bằng service + database constraint/index khi phù hợp.

### 4. Server/Client Boundary

Prisma bị import nhầm vào Client Component sẽ gây lỗi kiến trúc hoặc làm lộ server-only dependency.

**Mitigation:** Prisma chỉ tồn tại trong server-side repository/lib. UI gọi Route Handler hoặc server-side function phù hợp.

### 5. Delete Behavior

Cascade sai có thể xóa nhiều dữ liệu hơn dự kiến; restrict sai có thể làm user không xóa được dữ liệu hợp lệ.

**Mitigation:** Ghi rõ `onDelete` strategy trong schema và test từng dependency rule.

### 6. Production Database Connectivity

PostgreSQL Docker local chỉ phục vụ development nếu Next.js production được deploy ở môi trường khác.

**Mitigation:** Chọn managed PostgreSQL hoặc self-hosted PostgreSQL có network access phù hợp trước production.

### 7. Migration From Existing Google Sheets

Nếu Google Sheets cũ đã có dữ liệu thật, cần mapping dữ liệu sang PostgreSQL.

**Mitigation:** Viết script import một lần, validate duplicate và relation trước khi import. Không import trực tiếp mà không backup nguồn.

## Scalability Boundary

Quy mô hiện tại dưới 100 tour nên kiến trúc modular monolith Next.js + Prisma + PostgreSQL là đủ.

Nếu sau này có:

- nhiều client khác nhau;
- mobile app;
- desktop app;
- public API;
- queue/worker lớn;
- background processing nặng;
- backend cần scale độc lập;

thì cần đánh giá việc tách backend riêng.

## Latest Runtime Risk

- Form tour hiện phụ thuộc việc API thương hiệu theo `linhVucId` phản hồi đúng; cần e2e test để phát hiện lỗi khi đổi lĩnh vực liên tục hoặc khi lĩnh vực chưa có thương hiệu.

- Repository thương hiệu hiện dùng raw SQL cho một số thao tác list/create để tương thích với Prisma Client đang chạy trong giai đoạn schema thay đổi. Cần đồng bộ lại Prisma Client sau khi dừng dev server và kiểm thử lại toàn bộ CRUD.
- Bộ lọc tour đã build thành công và API cơ bản trả `200 OK`, nhưng chưa có browser e2e xác nhận state reload và hiển thị kết quả sau mỗi lần chọn dropdown.

## Deferred Decisions

- [CHƯA XÁC NHẬN] Kiểu ID cuối cùng: `cuid`, `uuid` hoặc strategy khác.
- [CHƯA XÁC NHẬN] Prisma version cụ thể và config style tương ứng.
- [CHƯA XÁC NHẬN] Authentication cho production internal app.
- [CHƯA XÁC NHẬN] Production PostgreSQL provider.
- [CHƯA XÁC NHẬN] Production hosting của Next.js.
- [CHƯA XÁC NHẬN] Có migrate dữ liệu thật từ Google Sheets cũ hay khởi tạo database mới.
