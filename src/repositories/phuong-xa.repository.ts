import { prisma } from '@/lib/prisma';
import { AppError, isPrismaNotFoundError, isPrismaUniqueError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';

export async function listPhuongXa(khuVucId?: string) {
  return prisma.phuongXa.findMany({
    where: khuVucId ? { khuVucId } : undefined,
    include: {
      khuVuc: true,
      _count: { select: { chiNhanhs: true } },
    },
    orderBy: [{ khuVuc: { name: 'asc' } }, { name: 'asc' }],
  });
}

export async function findPhuongXaById(id: string) {
  return prisma.phuongXa.findUnique({
    where: { id },
    include: { khuVuc: true, _count: { select: { chiNhanhs: true } } },
  });
}

export async function findPhuongXasByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.phuongXa.findMany({
    where: { id: { in: ids } },
    include: { khuVuc: true },
  });
}

export async function findPhuongXaByNameInKhuVuc(khuVucId: string, name: string) {
  const normalized = normalizeText(name).toLocaleLowerCase('vi-VN');
  const rows = await prisma.phuongXa.findMany({ where: { khuVucId } });
  return rows.find((item) => normalizeText(item.name).toLocaleLowerCase('vi-VN') === normalized) ?? null;
}

export async function createPhuongXa(khuVucId: string, name: string) {
  try {
    return await prisma.phuongXa.create({
      data: { khuVucId, name: normalizeText(name) },
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Tên phường/xã đã tồn tại', 'PHUONGXA_DUPLICATE');
    }
    throw new AppError('Lỗi khi tạo phường/xã', 'PHUONGXA_CREATE_FAILED');
  }
}

export async function updatePhuongXa(id: string, data: { name: string; khuVucId: string }) {
  try {
    return await prisma.phuongXa.update({
      where: { id },
      data: { name: normalizeText(data.name), khuVucId: data.khuVucId },
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Tên phường/xã đã tồn tại', 'PHUONGXA_DUPLICATE');
    }
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Phường/xã không tồn tại', 'PHUONGXA_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi cập nhật phường/xã', 'PHUONGXA_UPDATE_FAILED');
  }
}

export async function countPhuongXaBranches(id: string) {
  return prisma.chiNhanh.count({ where: { phuongXaId: id } });
}

export async function deletePhuongXa(id: string) {
  try {
    await prisma.phuongXa.delete({ where: { id } });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Phường/xã không tồn tại', 'PHUONGXA_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi xóa phường/xã', 'PHUONGXA_DELETE_FAILED');
  }
}
