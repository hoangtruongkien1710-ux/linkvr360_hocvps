import { prisma } from '@/lib/prisma';
import { AppError, isPrismaNotFoundError, isPrismaUniqueError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';

export async function listLinhVuc() {
  return prisma.linhVuc.findMany({
    include: { _count: { select: { tours: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function findLinhVucById(id: string) {
  return prisma.linhVuc.findUnique({ where: { id }, include: { _count: { select: { tours: true } } } });
}

export async function createLinhVuc(name: string) {
  try { return await prisma.linhVuc.create({ data: { name: normalizeText(name) } }); }
  catch (error) {
    if (isPrismaUniqueError(error)) throw new AppError('Tên lĩnh vực đã tồn tại', 'LINHVUC_DUPLICATE');
    throw new AppError('Lỗi khi tạo lĩnh vực', 'LINHVUC_CREATE_FAILED');
  }
}

export async function updateLinhVuc(id: string, name: string) {
  try { return await prisma.linhVuc.update({ where: { id }, data: { name: normalizeText(name) } }); }
  catch (error) {
    if (isPrismaUniqueError(error)) throw new AppError('Tên lĩnh vực đã tồn tại', 'LINHVUC_DUPLICATE');
    if (isPrismaNotFoundError(error)) throw new AppError('Lĩnh vực không tồn tại', 'LINHVUC_NOT_FOUND', 404);
    throw new AppError('Lỗi khi cập nhật lĩnh vực', 'LINHVUC_UPDATE_FAILED');
  }
}

export async function deleteLinhVuc(id: string) {
  try { await prisma.linhVuc.delete({ where: { id } }); }
  catch (error) {
    if (isPrismaNotFoundError(error)) throw new AppError('Lĩnh vực không tồn tại', 'LINHVUC_NOT_FOUND', 404);
    throw new AppError('Lỗi khi xóa lĩnh vực', 'LINHVUC_DELETE_FAILED');
  }
}
