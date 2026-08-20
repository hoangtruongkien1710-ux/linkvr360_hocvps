# TOUR_CATEGORIES.md

## Mục tiêu
Mở rộng app **Quản Lý Tour VR360** hiện tại (dành cho Nhà Hàng) thành hệ thống hỗ trợ **nhiều lĩnh vực tour VR360** (Nhà Hàng, Khách sạn, Quán Cà Phê, Spa, Du thuyền, v.v.).  
Tất cả các loại tour đều dùng **cùng định dạng URL VR360** (không cần map URL riêng).

## Nguyên tắc thiết kế
- Dùng **single entity `Tour`** với `type`.
- Không tạo entity riêng cho từng loại tour (tránh phức tạp schema).
- Dùng `TourType` enum để validate type.
- Giữ nguyên 100% business rule hiện có (unique Thương hiệu + Khu vực, 1 URL VR360 chung, nhiều ChiNhanh, v.v.).

## Entity Tour Type

### Enum TourType
```prisma
enum TourType {
  RESTAURANT  // Nhà Hàng
  HOTEL       // Khách sạn
  CAFE        // Quán Cà Phê
  SPA         // Spa
  BOAT        // Du thuyền
  OTHER       // Các loại khác
}
```

### Entity Tour
```prisma
model Tour {
  id          String    @id @default(cuid())
  name        String    // Tên thương hiệu (ví dụ: "The Garden", "Cà Phê X", "Resort Y")
  type        TourType
  brand       String    // Tên thương hiệu đầy đủ (cùng unique với Khu vực)
  khuVucId    String
  khuVuc      KhuVuc    @relation(fields: [khuVucId], references: [id])
  url         String    // URL VR360 chung (cùng định dạng tất cả loại)
  status      String    @default("Đang hoạt động")
  chiNhanhs   ChiNhanh[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([brand, khuVucId])
}
```

### Entity ChiNhanh (giữ nguyên)
```prisma
model ChiNhanh {
  id          String    @id @default(cuid())
  name        String
  phuongXaId  String
  phuongXa    PhuongXa  @relation(fields: [phuongXaId], references: [id])
  diaChi      String?
  tourId      String
  tour        Tour      @relation(fields: [tourId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([name, tourId])
}
```

### KhuVuc & PhuongXa (giữ nguyên)
```prisma
model KhuVuc {
  id        String   @id @default(cuid())
  name      String   @unique
  phuongXas PhuongXa[]
  tours     Tour[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PhuongXa {
  id        String    @id @default(cuid())
  name      String    @unique
  khuVucId  String
  khuVuc    KhuVuc    @relation(fields: [khuVucId], references: [id])
  chiNhanhs ChiNhanh[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## Business Rule Mới (giữ nguyên + extension)

1. **Unique rule** (giữ nguyên):
   - `Tên thương hiệu + Khu vực` là duy nhất sau normalize
   - Tên khu vực/phường/xã là duy nhất theo khu vực

2. **Extension rule**:
   - Mỗi `Tour` có `type` (bắt buộc)
   - URL VR360 có thể trùng lặp giữa các loại tour khác nhau (ví dụ: nhiều quán cà phê có thể dùng URL giống nhau)
   - ChiNhanh chỉ thuộc 1 Tour (không thể chia sẻ giữa các loại tour)

3. **Validation khi tạo/sửa**:
   - Phải chọn `khuVuc` và `phuongXa` thuộc khu vực đó
   - Chi nhánh phải thuộc đúng type của tour
   - Khi thêm chi nhánh phải chọn phường/xã trong khu vực của tour

## Flow khi tạo Tour mới (ví dụ 3 loại)

**Loại 1: Nhà Hàng**
- Brand: "The Garden"
- Type: RESTAURANT
- Khu vực: "Bắc Ninh"
- URL: "https://vr360.example.com/0001"

**Loại 2: Khách sạn**
- Brand: "Grand Palace"
- Type: HOTEL
- Khu vực: "Hà Nội"
- URL: "https://vr360.example.com/0002"

**Loại 3: Quán Cà Phê**
- Brand: "Coffee Corner"
- Type: CAFE
- Khu vực: "Bắc Ninh"
- URL: "https://vr360.example.com/0003"   // có thể trùng URL với nhà hàng khác

## Update file cần thiết

Sau khi tạo schema, các file sau sẽ cần update:
- `PROJECT_STATE.md` (thêm phần "Tour Categories")
- `REQUIREMENTS.md` (thêm section về Tour Type)
- `DECISIONS_LOG.md` (thêm "Tour Categories" decision)
- `TODO_NEXT.md` (thêm bước tạo schema + seed data)

---

**Hoàn tất thiết kế!**

Bạn kiểm tra xem có gì cần chỉnh không:
- Enum `TourType` (có cần thêm loại nào khác không?)
- Các rule business có khớp không?
- Muốn thêm field nào cho từng loại tour (ví dụ: Hotel có số sao, Cafe có menu, v.v.)?

Nếu OK, mình sẽ:
1. Tạo file `schema.prisma` đầy đủ
2. Tạo migration đầu tiên
3. Update `PROJECT_STATE.md`
4. Tiếp tục phần Service/Repository

Bạn cho biết "OK" hoặc chỉnh gì nhé!