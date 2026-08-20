-- AlterTable
ALTER TABLE "ThuongHieu" ADD COLUMN     "linhVucId" TEXT;

-- AddForeignKey
ALTER TABLE "ThuongHieu" ADD CONSTRAINT "ThuongHieu_linhVucId_fkey" FOREIGN KEY ("linhVucId") REFERENCES "LinhVuc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
