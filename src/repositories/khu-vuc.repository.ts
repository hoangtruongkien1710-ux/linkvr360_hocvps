import { prisma } from '@/lib/prisma';
import { AppError, isPrismaNotFoundError, isPrismaUniqueError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';

export async function listKhuVuc() {
  return prisma.khuVuc.findMany({
    include: {
      _count: { select: { phuongXas: true, tours: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function findKhuVucById(id: string) {
  return prisma.khuVuc.findUnique({
    where: { id },
    include: {
      phuongXas: { orderBy: { name: 'asc' } },
      _count: { select: { phuongXas: true, tours: true } },
    },
  });
}

export async function findKhuVucByNormalizedName(name: string) {
  const normalized = normalizeText(name);
  const rows = await prisma.khuVuc.findMany();
  return rows.find((item) => normalizeText(item.name).toLocaleLowerCase('vi-VN') === normalized.toLocaleLowerCase('vi-VN')) ?? null;
}

export async function createKhuVuc(name: string) {
  try {
    return await prisma.khuVuc.create({ data: { name: normalizeText(name) } });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Tên khu vực đã tồn tại', 'KHUVUC_DUPLICATE');
    }
    throw new AppError('Lỗi khi tạo khu vực', 'KHUVUC_CREATE_FAILED');
  }
}

export async function updateKhuVuc(id: string, name: string) {
  try {
    return await prisma.khuVuc.update({
      where: { id },
      data: { name: normalizeText(name) },
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Tên khu vực đã tồn tại', 'KHUVUC_DUPLICATE');
    }
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi cập nhật khu vực', 'KHUVUC_UPDATE_FAILED');
  }
}

export async function countKhuVucDependencies(id: string) {
  const [phuongXaCount, tourCount] = await Promise.all([
    prisma.phuongXa.count({ where: { khuVucId: id } }),
    prisma.tour.count({ where: { khuVucId: id } }),
  ]);
  return { phuongXaCount, tourCount };
}

export async function deleteKhuVuc(id: string) {
  try {
    await prisma.khuVuc.delete({ where: { id } });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi xóa khu vực', 'KHUVUC_DELETE_FAILED');
  }
}
