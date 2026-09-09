import { Prisma, TourType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError, isPrismaNotFoundError, isPrismaUniqueError } from '@/lib/errors';

export type BranchInput = {
  id?: string;
  name: string;
  phuongXaId: string;
  diaChi?: string | null;
  soDienThoai?: string | null;
};

const tourInclude = {
  khuVuc: true,
  thuongHieu: true,
  linhVuc: true,
  chiNhanhs: {
    include: { phuongXa: true },
    orderBy: { name: 'asc' as const },
  },
} satisfies Prisma.TourInclude;

export async function findTourById(id: string) {
  return prisma.tour.findUnique({ where: { id }, include: tourInclude });
}

export async function listTours(filters?: {
  search?: string;
  khuVucId?: string;
  phuongXaId?: string;
  status?: string;
  thuongHieuId?: string;
  linhVucId?: string;
}) {
  const search = filters?.search?.trim();
  return prisma.tour.findMany({
    where: {
      ...(filters?.khuVucId ? { khuVucId: filters.khuVucId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.thuongHieuId ? { thuongHieuId: filters.thuongHieuId } : {}),
      ...(filters?.linhVucId ? { linhVucId: filters.linhVucId } : {}),
      ...(filters?.phuongXaId
        ? { chiNhanhs: { some: { phuongXaId: filters.phuongXaId } } }
        : {}),
      ...(search
        ? {
            OR: [
              { brand: { contains: search, mode: 'insensitive' } },
              { chiNhanhs: { some: { name: { contains: search, mode: 'insensitive' } } } },
              { chiNhanhs: { some: { diaChi: { contains: search, mode: 'insensitive' } } } },
              { chiNhanhs: { some: { soDienThoai: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
    include: tourInclude,
    orderBy: { brand: 'asc' },
  });
}

export async function createTour(data: {
  brand: string;
  type: TourType;
  thuongHieuId: string;
  linhVucId: string;
  khuVucId: string;
  url: string;
  status: string;
  chiNhanhs: BranchInput[];
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const tour = await tx.tour.create({
        data: {
          brand: data.brand,
          name: data.brand,
          type: data.type,
          thuongHieuId: data.thuongHieuId,
          linhVucId: data.linhVucId,
          khuVucId: data.khuVucId,
          url: data.url,
          status: data.status,
          chiNhanhs: {
            create: data.chiNhanhs.map((branch) => ({
              name: branch.name,
              phuongXaId: branch.phuongXaId,
              diaChi: branch.diaChi ?? null,
              soDienThoai: branch.soDienThoai ?? null,
            })),
          },
        },
        include: tourInclude,
      });
      return tour;
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Thương hiệu/khu vực hoặc URL VR360 đã tồn tại', 'TOUR_DUPLICATE');
    }
    throw new AppError('Lỗi khi tạo tour', 'TOUR_CREATE_FAILED');
  }
}

export async function updateTour(
  id: string,
  data: {
    brand: string;
    type: TourType;
    thuongHieuId: string;
    linhVucId: string;
    khuVucId: string;
    url: string;
    status: string;
    chiNhanhs: BranchInput[];
  },
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.chiNhanh.deleteMany({ where: { tourId: id } });
      return tx.tour.update({
        where: { id },
        data: {
          brand: data.brand,
          name: data.brand,
          type: data.type,
          thuongHieuId: data.thuongHieuId,
          linhVucId: data.linhVucId,
          khuVucId: data.khuVucId,
          url: data.url,
          status: data.status,
          chiNhanhs: {
            create: data.chiNhanhs.map((branch) => ({
              name: branch.name,
              phuongXaId: branch.phuongXaId,
              diaChi: branch.diaChi ?? null,
              soDienThoai: branch.soDienThoai ?? null,
            })),
          },
        },
        include: tourInclude,
      });
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      throw new AppError('Thương hiệu/khu vực hoặc URL VR360 đã tồn tại', 'TOUR_DUPLICATE');
    }
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Tour không tồn tại', 'TOUR_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi cập nhật tour', 'TOUR_UPDATE_FAILED');
  }
}

export async function deleteTour(id: string) {
  try {
    await prisma.tour.delete({ where: { id } });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      throw new AppError('Tour không tồn tại', 'TOUR_NOT_FOUND', 404);
    }
    throw new AppError('Lỗi khi xóa tour', 'TOUR_DELETE_FAILED');
  }
}
