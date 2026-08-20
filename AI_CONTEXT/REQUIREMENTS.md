# REQUIREMENTS

## Functional Requirements

### Khu vực và phường/xã

- Thêm, sửa, xóa khu vực.
- Thêm, sửa, xóa phường/xã thuộc một khu vực.
- Không cho phép xóa khu vực còn phường/xã hoặc tour liên quan.
- Không cho phép xóa phường/xã còn được chi nhánh sử dụng.
- Không cho phép chuyển phường/xã đang được chi nhánh sử dụng sang khu vực khác vì sẽ làm sai quan hệ giữa chi nhánh và khu vực của tour.

### Lĩnh vực và thương hiệu

- Mục Tổng quan hiển thị danh sách lĩnh vực; mỗi mục chỉ hiển thị tên lĩnh vực, không hiển thị số tour bên dưới.
- Chọn một lĩnh vực sẽ hiển thị toàn bộ thương hiệu thuộc lĩnh vực đó, kể cả thương hiệu chưa được gắn vào tour.
- Cho phép thêm, sửa và xóa thương hiệu trong lĩnh vực đang chọn.
- Cho phép thêm, sửa và xóa lĩnh vực.
- Thương hiệu được liên kết với lĩnh vực bằng ID; quan hệ không phụ thuộc vào việc thương hiệu đã có tour hay chưa.

### Tour và chi nhánh

- Thêm, xem, sửa và xóa tour.
- Một biểu mẫu thêm/sửa tour phải cho phép thêm, sửa và xóa nhiều chi nhánh trực thuộc.
- Mỗi tour gồm:
  - tên thương hiệu;
  - khu vực;
  - link VR360;
  - trạng thái;
  - ít nhất một chi nhánh.
- Mỗi chi nhánh gồm:
  - tên chi nhánh;
  - phường/xã;
  - địa chỉ.
- Nút `Xem tour` mở URL VR360 đã lưu ở tab/cửa sổ phù hợp; tour không được nhúng trong ứng dụng.
- Xóa tour phải yêu cầu xác nhận và sau đó xóa toàn bộ chi nhánh trực thuộc.

### Tra cứu và thống kê

- Tìm kiếm theo tên thương hiệu, tên chi nhánh hoặc địa chỉ.
- Lọc theo khu vực, phường/xã và trạng thái.
- Lọc theo phường/xã phải trả về tour có ít nhất một chi nhánh thuộc phường/xã đó.
- Hiển thị:
  - tổng số tour;
  - số tour đang hoạt động;
  - số tour tạm ngưng.
- Thống kê số tour theo khu vực.
- Thống kê số tour theo thương hiệu.

## Data Validation Rules

- Tên khu vực là duy nhất sau khi normalize chữ hoa/thường và khoảng trắng.
- Trong cùng một khu vực, tên phường/xã là duy nhất sau normalize.
- Tên thương hiệu là duy nhất toàn hệ thống sau normalize.
- Tổ hợp `Tên thương hiệu + Khu vực` của tour là duy nhất sau normalize tên thương hiệu.
- Thương hiệu có thể tồn tại mà chưa có tour; không dùng số tour làm điều kiện để hiển thị thương hiệu trong danh mục.
- Link VR360 phải có định dạng URL hợp lệ ở mức cơ bản.
- Chi nhánh chỉ được chọn phường/xã thuộc khu vực của tour.
- Trạng thái tour chỉ có hai giá trị nghiệp vụ:
  - `Đang hoạt động`;
  - `Tạm ngưng`.
- Tour phải có ít nhất một chi nhánh.

## Database Integrity Requirements

- Dùng ID ổn định để liên kết entity.
- Không dùng row number hoặc tên hiển thị làm khóa liên kết.
- Tạo/cập nhật tour và danh sách chi nhánh phải chạy trong transaction.
- Xóa tour phải xóa toàn bộ chi nhánh trực thuộc trong cùng thao tác an toàn.
- Xóa khu vực/phường-xã phải kiểm tra dependency trước khi thực hiện.
- Database constraint và service rule phải cùng bảo vệ các unique rule quan trọng khi khả thi.

## API Requirements

### Response Convention

API nên trả response nhất quán, ví dụ:

```json
{
  "ok": true,
  "data": {},
  "message": "",
  "error": null
}
```

Khi lỗi:

```json
{
  "ok": false,
  "data": null,
  "message": "Thông báo dễ hiểu cho người dùng",
  "error": "ERROR_CODE"
}
```

### Route Responsibilities

Route Handler chỉ:

- nhận request;
- parse input;
- validate input;
- gọi service;
- map lỗi sang HTTP status;
- trả response.

Không viết truy vấn Prisma trực tiếp trong Client Component.

## Suggested API Surface

Tên route có thể thay đổi theo convention của project, nhưng scope cần bao phủ:

```text
GET    /api/khu-vuc
POST   /api/khu-vuc
PATCH  /api/khu-vuc/:id
DELETE /api/khu-vuc/:id

GET    /api/phuong-xa
POST   /api/phuong-xa
PATCH  /api/phuong-xa/:id
DELETE /api/phuong-xa/:id

GET    /api/tours
POST   /api/tours
GET    /api/tours/:id
PATCH  /api/tours/:id
DELETE /api/tours/:id

GET    /api/stats
```

Không bắt buộc giữ đúng URL trên nếu codebase hiện tại đã có convention khác.

## User Interface Requirements

- Ngôn ngữ hiển thị: tiếng Việt.
- Tên ứng dụng: `APP Quản Lý Tour VR360 Nhà Hàng`.
- Font chữ: Roboto.
- Màu thương hiệu chủ đạo: cam.
- Desktop/laptop là ưu tiên.
- Giao diện vẫn phải usable trên màn hình nhỏ.
- Danh sách tour hiển thị:
  - thương hiệu;
  - khu vực;
  - số chi nhánh;
  - trạng thái;
  - thao tác xem tour;
  - sửa;
  - xóa.
- Không hiển thị ngày cập nhật trong danh sách tour.

## Error Handling Requirements

- Khi đọc/ghi dữ liệu lỗi, phải hiển thị lỗi rõ ràng.
- Với biểu mẫu thêm/sửa, dữ liệu người dùng đã nhập phải được giữ lại khi request thất bại.
- Không tự động retry request thất bại trong MVP.
- Không hiển thị raw stack trace hoặc database error trực tiếp cho người dùng.
- Lỗi unique/dependency phải được chuyển thành thông báo nghiệp vụ dễ hiểu.

## Acceptance Criteria

1. Có thể tạo, sửa và xóa khu vực/phường-xã; các rule dependency khi xóa được thực thi.
2. Có thể tạo một tour kèm từ một chi nhánh trở lên trong một thao tác.
3. Hệ thống từ chối tạo hoặc cập nhật làm trùng tổ hợp thương hiệu và khu vực.
4. Kết quả tìm kiếm và từng bộ lọc phù hợp với dữ liệu đã lưu.
5. Bộ lọc phường/xã áp dụng theo chi nhánh trực thuộc.
6. Các số tổng hợp và thống kê theo khu vực/thương hiệu khớp với PostgreSQL.
7. Nút `Xem tour` mở đúng URL của tour được chọn.
8. Xóa tour chỉ diễn ra sau xác nhận và không để lại chi nhánh mồ côi.
9. Danh sách tour không hiển thị ngày cập nhật.
10. Prisma không bị import vào Client Component.
11. Build/typecheck không có lỗi thuộc feature đã triển khai.
