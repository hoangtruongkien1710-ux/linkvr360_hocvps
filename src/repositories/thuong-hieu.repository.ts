import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { AppError, isPrismaNotFoundError, isPrismaUniqueError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';

export async function listThuongHieu(linhVucId?: string) {
  const rows = await prisma.$queryRaw`
    SELECT
      th.id,
      th.name,
      COALESCE(th."linhVucId", MIN(t."linhVucId")) AS "linhVucId",
      th."createdAt",
      th."updatedAt",
      COUNT(t.id)::int AS "tourCount"
    FROM "ThuongHieu" th
    LEFT JOIN "Tour" t ON t."thuongHieuId" = th.id
    GROUP BY th.id, th.name, th."linhVucId", th."createdAt", th."updatedAt"
    ORDER BY th.name ASC
  ` as Array<Record<string, unknown> & { linhVucId: string | null; tourCount: number }>;

  return rows
    .filter((row) => !linhVucId || row.linhVucId === linhVucId)
    .map(({ tourCount, ...row }) => ({ ...row, _count: { tours: tourCount } }));
}


export async function findThuongHieuById(id: string) {
  return prisma.thuongHieu.findUnique({ where: { id }, include: { _count: { select: { tours: true } } } });
}

export async function createThuongHieu(name: string, linhVucId?: string) {
  try {
    const normalized = normalizeText(name);
    if (!normalized) throw new AppError('Tên thương hiệu không được để trống', 'THUONGHIEU_NAME_REQUIRED');
    const id = randomUUID();
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO "ThuongHieu" (id, name, "linhVucId", "createdAt", "updatedAt")
      VALUES (${id}, ${normalized}, ${linhVucId || null}, NOW(), NOW())
      RETURNING id, name, "linhVucId", "createdAt", "updatedAt"
    `;
    return rows[0];
  } catch (error) {
    if (isPrismaUniqueError(error) || (error instanceof Error && error.message.includes('duplicate key'))) {
      throw new AppError('Tên thương hiệu đã tồn tại', 'THUONGHIEU_DUPLICATE');
    }
    throw new AppError('Lỗi khi tạo thương hiệu', 'THUONGHIEU_CREATE_FAILED');
  }
}

export async function updateThuongHieu(id: string, name: string) {
  try { return await prisma.thuongHieu.update({ where: { id }, data: { name: normalizeText(name) } }); }
  catch (error) {
    if (isPrismaUniqueError(error)) throw new AppError('Tên thương hiệu đã tồn tại', 'THUONGHIEU_DUPLICATE');
    if (isPrismaNotFoundError(error)) throw new AppError('Thương hiệu không tồn tại', 'THUONGHIEU_NOT_FOUND', 404);
    throw new AppError('Lỗi khi cập nhật thương hiệu', 'THUONGHIEU_UPDATE_FAILED');
  }
}

export async function deleteThuongHieu(id: string) {
  try { await prisma.thuongHieu.delete({ where: { id } }); }
  catch (error) {
    if (isPrismaNotFoundError(error)) throw new AppError('Thương hiệu không tồn tại', 'THUONGHIEU_NOT_FOUND', 404);
    throw new AppError('Lỗi khi xóa thương hiệu', 'THUONGHIEU_DELETE_FAILED');
  }
}
