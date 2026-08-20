-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "linhVucId" TEXT,
ADD COLUMN     "thuongHieuId" TEXT;

-- CreateTable
CREATE TABLE "ThuongHieu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThuongHieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinhVuc" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinhVuc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThuongHieu_name_key" ON "ThuongHieu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LinhVuc_name_key" ON "LinhVuc"("name");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_thuongHieuId_fkey" FOREIGN KEY ("thuongHieuId") REFERENCES "ThuongHieu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_linhVucId_fkey" FOREIGN KEY ("linhVucId") REFERENCES "LinhVuc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
