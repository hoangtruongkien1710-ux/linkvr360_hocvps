import { prisma } from '@/lib/prisma';

export async function getStats() {
  const [total, active, paused, byKhuVuc, byBrand, byLinhVuc] = await Promise.all([
    prisma.tour.count(),
    prisma.tour.count({ where: { status: 'Đang hoạt động' } }),
    prisma.tour.count({ where: { status: 'Tạm ngưng' } }),
    prisma.tour.groupBy({
      by: ['khuVucId'],
      _count: { _all: true },
    }),
    prisma.tour.groupBy({
      by: ['brand'],
      _count: { _all: true },
      orderBy: { _count: { brand: 'desc' } },
    }),
    prisma.tour.groupBy({
      by: ['type'],
      _count: { _all: true },
      orderBy: { _count: { type: 'desc' } },
    }),
  ]);

  const khuVucs = await prisma.khuVuc.findMany({
    where: { id: { in: byKhuVuc.map((item) => item.khuVucId) } },
    select: { id: true, name: true },
  });
  const khuVucNameMap = new Map(khuVucs.map((item) => [item.id, item.name]));

  return {
    total,
    active,
    paused,
    byKhuVuc: byKhuVuc.map((item) => ({
      khuVucId: item.khuVucId,
      name: khuVucNameMap.get(item.khuVucId) ?? item.khuVucId,
      count: item._count._all,
    })),
    byBrand: byBrand.map((item) => ({
      brand: item.brand,
      count: item._count._all,
    })),
    byLinhVuc: byLinhVuc.map((item) => ({
      type: item.type,
      count: item._count._all,
    })),
  };
}
