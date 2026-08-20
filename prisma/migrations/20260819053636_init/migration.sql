-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('RESTAURANT', 'HOTEL', 'CAFE', 'SPA', 'BOAT', 'OTHER');

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TourType" NOT NULL,
    "brand" TEXT NOT NULL,
    "khuVucId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Đang hoạt động',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiNhanh" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phuongXaId" TEXT NOT NULL,
    "diaChi" TEXT,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiNhanh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhuVuc" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KhuVuc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhuongXa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "khuVucId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhuongXa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tour_brand_khuVucId_key" ON "Tour"("brand", "khuVucId");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_url_key" ON "Tour"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ChiNhanh_name_tourId_key" ON "ChiNhanh"("name", "tourId");

-- CreateIndex
CREATE UNIQUE INDEX "KhuVuc_name_key" ON "KhuVuc"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PhuongXa_name_key" ON "PhuongXa"("name");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_khuVucId_fkey" FOREIGN KEY ("khuVucId") REFERENCES "KhuVuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiNhanh" ADD CONSTRAINT "ChiNhanh_phuongXaId_fkey" FOREIGN KEY ("phuongXaId") REFERENCES "PhuongXa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiNhanh" ADD CONSTRAINT "ChiNhanh_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhuongXa" ADD CONSTRAINT "PhuongXa_khuVucId_fkey" FOREIGN KEY ("khuVucId") REFERENCES "KhuVuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
