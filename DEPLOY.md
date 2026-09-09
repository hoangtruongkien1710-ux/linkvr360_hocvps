# Hướng dẫn Deploy — Tour 360 (linkvr360_hocvps)

## 1. Mô hình hai môi trường

| | Development (máy bạn) | Production (VPS) |
|---|---|---|
| Chạy bằng | `npm run dev` (Node trực tiếp) | Docker Compose |
| URL | http://localhost:3000 | http://103.56.160.214:8080 |
| Database | PostgreSQL Docker, cổng host `5433` | PostgreSQL trong Compose (service `db`) |
| File cấu hình | `.env` | `.env.production` (chỉ nằm trên VPS, KHÔNG commit) |
| Hot reload | Có | Không — phải build lại image |
| Nguồn code | Bạn sửa file trực tiếp | `git pull` từ GitHub |

**Luồng làm việc:**

```
Sửa + test ở local  →  git commit  →  git push (GitHub)  →  SSH vào VPS  →  git pull  →  build lại container
```

> VPS này chạy chung nhiều project khác (host nginx đang giữ cổng 80/443 cho các domain khác).
> App này chạy độc lập trên cổng **8080**, truy cập trực tiếp bằng IP — không dùng nginx riêng.
> Muốn gắn tên miền + HTTPS sau này: thêm một `server` block vào host nginx proxy sang `127.0.0.1:8080`.

---

## 2. Làm việc ở local

```bash
docker compose up -d
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` **bắt buộc chạy trước khi push** — build production phải pass.
Nếu chỉ sửa giao diện và không đụng `prisma/schema.prisma` thì bỏ qua phần migration.

---

## 3. Đẩy code lên GitHub

```bash
git add -A && git commit -m "Cập nhật ..." && git push origin main
```

---

## 4. Lần đầu cài trên VPS

SSH vào máy chủ:

```bash
ssh kiensmee@103.56.160.214 -p 24700
```

Tải code:

```bash
cd ~ && git clone https://github.com/hoangtruongkien1710-ux/linkvr360_hocvps.git && cd linkvr360_hocvps
```

Tạo `.env.production` (tự sinh mật khẩu, điền đúng cả 2 chỗ):

```bash
DB_PASS=$(openssl rand -hex 24)
cat > .env.production <<EOF
DB_NAME=tour360
DB_USER=tour360
DB_PASSWORD=$DB_PASS
DATABASE_URL=postgresql://tour360:$DB_PASS@db:5432/tour360
APP_PORT=8080
NEXT_PUBLIC_APP_URL=http://103.56.160.214:8080
EOF
cat .env.production
```

Lưu mật khẩu vào chỗ an toàn. Sau đó build + chạy:

```bash
docker compose -f compose.production.yaml --env-file .env.production up -d --build
```

Mở firewall cổng 8080 nếu VPS dùng ufw:

```bash
sudo ufw allow 8080/tcp
```

---

## 5. Cập nhật VPS (các lần sau)

```bash
cd ~/linkvr360_hocvps && git pull origin main && docker compose -f compose.production.yaml --env-file .env.production up -d --build
```

Hoặc dùng script (khuyến nghị — deploy theo phiên bản, xem mục 9):

```bash
cd ~/linkvr360_hocvps && chmod +x deploy.sh && ./deploy.sh v1.1.0
```

> `deploy.sh` chạy `git checkout -f` / `git reset --hard` — **ghi đè mọi thay đổi local trên VPS**. Không sửa code trực tiếp trên VPS.

Lệnh deploy tự động:
1. Build lại image từ code mới (`Dockerfile`, multi-stage).
2. Service `migrate` chạy `npx prisma migrate deploy` — áp dụng migration mới nếu có.
3. Khởi động lại `app` sau khi `migrate` xong và healthcheck pass.

Dữ liệu PostgreSQL nằm trong volume `linkvr360_hocvps_postgres_data`, **không mất** khi rebuild app.

---

## 6. Kiểm tra sau khi deploy

```bash
docker compose -f compose.production.yaml ps
```

```bash
docker compose -f compose.production.yaml logs -f app
```

```bash
curl -I http://localhost:8080
```

`db` / `app` = `Up`, `migrate` = `Exited (0)`, curl trả `200 OK`.

---

## 7. Migration database

Khi bạn sửa `prisma/schema.prisma`, ở **local**:

```bash
npx prisma migrate dev --name mo_ta_thay_doi
```

```bash
git add prisma/migrations && git commit -m "DB: mo_ta_thay_doi" && git push origin main
```

VPS tự chạy `prisma migrate deploy` khi deploy — **không** chạy `migrate dev` trên VPS.

---

## 8. Rollback khi bản mới lỗi

Deploy lại phiên bản ổn định trước đó bằng tag:

```bash
cd ~/linkvr360_hocvps && ./deploy.sh v1.0.0
```

Xem các phiên bản có sẵn:

```bash
git fetch --tags && git tag -l
```

Rollback migration là việc khó — cẩn thận khi đổi schema. Với thay đổi giao diện thuần thì rollback code là đủ.

---

## 9. Quản lý phiên bản (tag & release)

Làm ở **máy local**, sau khi code đã `git push` lên `main` và `npm run build` pass.

**1. Cập nhật `CHANGELOG.md`** — chuyển mục "[Chưa phát hành]" thành số phiên bản mới.

**2. Tăng version trong `package.json`** (dòng `"version"`).

**3. Commit, tạo tag, push:**

```bash
git add -A && git commit -m "Release v1.2.0"
git tag -a v1.2.0 -m "v1.2.0 — mô tả ngắn"
git push origin main --follow-tags
```

**4. Tạo Release trên GitHub:** vào
`github.com/hoangtruongkien1710-ux/linkvr360_hocvps` → **Releases** → **Draft a new release**
→ chọn tag `v1.2.0` → dán nội dung tương ứng trong `CHANGELOG.md` → **Publish**.

(Nếu cài `gh`: `gh release create v1.2.0 --title v1.2.0 --notes-file <(sed -n '/## \[1.2.0\]/,/## \[/p' CHANGELOG.md)`.)

**5. Deploy phiên bản đó lên VPS:**

```bash
./deploy.sh v1.2.0
```

### Quy tắc đánh số `vX.Y.Z`

| Loại thay đổi | Ví dụ | Tăng |
|---|---|---|
| Sửa lỗi, không đổi cách dùng | `v1.1.0 → v1.1.1` | Z (patch) |
| Thêm tính năng, vẫn tương thích | `v1.1.1 → v1.2.0` | Y (minor) |
| Thay đổi lớn / phá vỡ tương thích | `v1.9.0 → v2.0.0` | X (major) |

Số phiên bản đang chạy hiển thị ở chân sidebar của app — đối chiếu với `git tag` khi production có lỗi mà local thì không.

---

## 10. Lưu ý

- `.env.production` **chỉ tồn tại trên VPS**, nằm trong `.gitignore`. Không bao giờ commit.
- `DB_PASSWORD` và mật khẩu trong `DATABASE_URL` phải **giống hệt nhau**. `DATABASE_URL` dùng host `db` (tên service Compose), không phải `localhost`. Không viết chú thích `#` cùng dòng với giá trị.
- Đổi cổng: sửa `APP_PORT` trong `.env.production` rồi deploy lại.
- `docker compose up -d --build` có downtime vài giây khi restart `app` — chấp nhận được với vài người dùng nội bộ.
- 2 file compose trong repo: `compose.yaml` (chỉ Postgres cho dev, chạy ở local), `compose.production.yaml` (production: db + migrate + app — **luôn dùng file này trên VPS**).
- App khởi đầu với database rỗng; nhập dữ liệu qua giao diện.
