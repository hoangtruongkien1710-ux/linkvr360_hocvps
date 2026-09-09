# Hướng dẫn Deploy — Tour 360 (thống kê VR360)

## 1. Mô hình hai môi trường

| | Development (máy bạn) | Production (VPS) |
|---|---|---|
| Chạy bằng | `npm run dev` (Node trực tiếp) | Docker Compose |
| URL | http://localhost:3000 | http://103.56.160.214 (Nginx cổng 80) |
| Database | PostgreSQL Docker, cổng host `5433` | PostgreSQL trong Compose (service `db`) |
| File cấu hình | `.env` | `.env.production` (chỉ nằm trên VPS, KHÔNG commit) |
| Hot reload | Có | Không — phải build lại image |
| Nguồn code | Bạn sửa file trực tiếp | `git pull` từ GitHub |

**Luồng làm việc:**

```
Sửa + test ở local  →  git commit  →  git push (GitHub)  →  SSH vào VPS  →  git pull  →  build lại container
```

Local chính là "bản phát triển", VPS là "bản cho người dùng". Chưa cần staging riêng cho quy mô 1 người dùng nội bộ (xem mục 7 nếu sau này cần).

---

## 2. Làm việc ở local

```bash
docker compose up -d      # bật PostgreSQL dev (nếu chưa chạy)
npm run dev               # mở http://localhost:3000, sửa src/app/page.tsx ...
npm run build             # BẮT BUỘC chạy trước khi push — build production phải pass
```

Nếu chỉ sửa giao diện (`src/app/page.tsx`, `src/app/globals.css`) và không đụng `prisma/schema.prisma` thì bỏ qua phần migration.

---

## 3. Đẩy code lên GitHub

```bash
git add -A
git commit -m "Cập nhật giao diện ..."
git push origin main
```

---

## 4. Cập nhật VPS

SSH vào máy chủ:

```bash
ssh kiensmee@103.56.160.214 -p 24700
```

Vào thư mục project (nơi đã `git clone` lúc đầu), ví dụ:

```bash
cd ~/linkvr360_hocvps
```

> Lần đầu tiên, nếu VPS chưa có code:
> `git clone https://github.com/hoangtruongkien1710-ux/linkvr360_hocvps.git`
> rồi tạo `.env.production` từ `.env.production.example` và điền secret thật.
>
> Lưu ý khi điền `.env.production`:
> - `DB_PASSWORD` và mật khẩu bên trong `DATABASE_URL` phải **giống hệt nhau**.
> - Không viết chú thích `#` nằm cùng dòng với giá trị.

Deploy:

```bash
git pull origin main
docker compose -f compose.production.yaml --env-file .env.production up -d --build
```

Lệnh này tự động:
1. Build lại image từ code mới (`Dockerfile`, multi-stage).
2. Chạy service `migrate` → `npx prisma migrate deploy` → áp dụng migration mới nếu có.
3. Khởi động lại service `app` sau khi healthcheck pass.
4. Nginx giữ nguyên, tiếp tục proxy sang `app:3000`.

Dữ liệu PostgreSQL nằm trong volume `postgres_data`, **không mất** khi rebuild app.

Kiểm tra sau khi deploy:

```bash
docker compose -f compose.production.yaml ps
docker compose -f compose.production.yaml logs -f app
curl -I http://localhost
```

---

## 5. Script deploy gọn (đặt trên VPS)

Xem file [`deploy.sh`](deploy.sh) trong repo. Trên VPS chỉ cần:

```bash
chmod +x deploy.sh   # chạy 1 lần
./deploy.sh          # mỗi lần cập nhật
```

---

## 6. Migration database

Khi bạn sửa `prisma/schema.prisma`:

```bash
# Ở LOCAL:
npx prisma migrate dev --name mo_ta_thay_doi   # tạo file trong prisma/migrations/
git add prisma/migrations
git commit -m "DB: mo_ta_thay_doi"
git push origin main
```

VPS sẽ tự chạy `prisma migrate deploy` khi bạn deploy — **không** chạy `migrate dev` trên VPS.

---

## 7. Rollback khi bản mới lỗi

```bash
# Trên VPS:
git log --oneline -5
git checkout <commit_ổn_định_trước_đó>
docker compose -f compose.production.yaml --env-file .env.production up -d --build
```

(Rollback migration là việc khó — cẩn thận khi đổi schema. Với thay đổi giao diện thuần thì rollback code là đủ.)

---

## 8. Lưu ý

- `.env.production` **chỉ tồn tại trên VPS**, đã nằm trong `.gitignore`. Không bao giờ commit. `DATABASE_URL` phải dùng host `db` (tên service Compose), không phải `localhost`.
- `docker compose up -d --build` có downtime vài giây khi restart `app` — chấp nhận được với 1 người dùng nội bộ.
- Có 2 file compose trong repo: `compose.yaml` (chỉ Postgres cho dev, chạy ở local), `compose.production.yaml` (production đầy đủ: db + migrate + app + nginx — **luôn dùng file này trên VPS**).
- Muốn có staging: tạo branch `dev`, copy `compose.production.yaml` thành `compose.staging.yaml`, đổi cổng Nginx `80` → `8080`, đổi `-p` project name và tên volume, rồi deploy branch `dev` vào đó.
