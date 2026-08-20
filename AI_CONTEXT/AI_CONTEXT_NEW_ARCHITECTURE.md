# AI CONTEXT - NEW ARCHITECTURE

Tài liệu tổng hợp cho **APP Quản Lý Tour VR360 Nhà Hàng** sau khi chuyển kiến trúc từ Google Apps Script + Google Sheets sang **Next.js full-stack + Prisma + PostgreSQL**.

> Các file chi tiết nằm trong thư mục `AI_CONTEXT/` và là nguồn context ưu tiên cho AI khi tiếp tục dự án.

## Architecture Summary

```text
Browser / Next.js UI
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

Development database chạy bằng Docker Compose.

## Core Entities

- `KhuVuc`
- `PhuongXa`
- `Tour`
- `ChiNhanh`

## Core Product Rule

Một `Tour` là duy nhất theo **Thương hiệu + Khu vực**.

Một tour có một URL VR360 chung và một hoặc nhiều chi nhánh. Chi nhánh dùng để xác định phường/xã và phục vụ bộ lọc.

## AI Working Order

```text
READ
→ PLAN
→ DATABASE
→ SERVICE/REPOSITORY
→ API
→ UI
→ VERIFY
```

## Files

- `PROJECT_BRIEF.md`: mục tiêu sản phẩm và scope.
- `SYSTEM_ARCHITECTURE_CURRENT.md`: kiến trúc hiện tại/mục tiêu.
- `REQUIREMENTS.md`: functional rules, validation và acceptance criteria.
- `DECISIONS_LOG.md`: các quyết định kiến trúc.
- `PROJECT_STATE.md`: trạng thái migration hiện tại.
- `TECH_DEBT.md`: risk và tech debt.
- `TODO_NEXT.md`: thứ tự triển khai tiếp theo.
- `SESSION_HANDOVER.md`: handover cho phiên AI tiếp theo.
