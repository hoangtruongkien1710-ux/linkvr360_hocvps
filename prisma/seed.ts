import { PrismaClient, TourType } from '@prisma/client'

const prisma = new PrismaClient()

const typeToCatalog: Record<TourType, string> = {
  RESTAURANT: 'Nhà hàng', HOTEL: 'Khách sạn', CAFE: 'Quán cà phê', SPA: 'Spa', BOAT: 'Du thuyền', OTHER: 'Khác',
}

async function upsertLinhVuc(name: string) { return prisma.linhVuc.upsert({ where: { name }, update: {}, create: { name } }) }
async function upsertThuongHieu(name: string) { return prisma.thuongHieu.upsert({ where: { name }, update: {}, create: { name } }) }
async function upsertKhuVuc(name: string) { return prisma.khuVuc.upsert({ where: { name }, update: {}, create: { name } }) }
async function upsertPhuongXa(name: string, khuVucId: string) {
  const existing = await prisma.phuongXa.findFirst({ where: { name } })
  return existing ?? prisma.phuongXa.create({ data: { name, khuVucId } })
}

async function main() {
  const linhVucs = new Map<string, { id: string }>()
  for (const type of Object.keys(typeToCatalog) as TourType[]) linhVucs.set(type, await upsertLinhVuc(typeToCatalog[type]))
  const brands = new Map<string, { id: string }>()
  for (const name of ["McDonald's", 'Starbucks', 'Hyatt', 'Nhà hàng 1', 'Nhà hàng 2']) brands.set(name, await upsertThuongHieu(name))

  const quan1 = await upsertKhuVuc('Quận 1'); const quan3 = await upsertKhuVuc('Quận 3'); const quan7 = await upsertKhuVuc('Quận 7')
  const benNghe = await upsertPhuongXa('Bến Nghé', quan1.id); const phuong3 = await upsertPhuongXa('Phường 3', quan3.id); const phuong7 = await upsertPhuongXa('Phường 7', quan7.id)

  const samples = [
    { brand: "McDonald's", type: 'RESTAURANT' as TourType, url: 'https://vr360.mcd.com/hq1', khuVucId: quan1.id, ward: benNghe.id, branch: 'Chi nhánh 1', address: '123 Đường ABC' },
    { brand: 'Starbucks', type: 'CAFE' as TourType, url: 'https://vr360.starbucks.com/hq3', khuVucId: quan3.id, ward: phuong3.id, branch: 'Chi nhánh 2', address: '456 Đường XYZ' },
    { brand: 'Hyatt', type: 'HOTEL' as TourType, url: 'https://vr360.hyatt.com/hq7', khuVucId: quan7.id, ward: phuong7.id, branch: 'Chi nhánh 3', address: '789 Đường DEF' },
  ]
  for (const sample of samples) {
    const existing = await prisma.tour.findUnique({ where: { url: sample.url } })
    const data = { brand: sample.brand, name: sample.brand, type: sample.type, thuongHieuId: brands.get(sample.brand)!.id, linhVucId: linhVucs.get(sample.type)!.id, khuVucId: sample.khuVucId, url: sample.url, status: 'Đang hoạt động' }
    if (existing) await prisma.tour.update({ where: { id: existing.id }, data: { thuongHieuId: data.thuongHieuId, linhVucId: data.linhVucId } })
    else await prisma.tour.create({ data: { ...data, chiNhanhs: { create: [{ name: sample.branch, phuongXaId: sample.ward, diaChi: sample.address }] } } })
  }

  for (const tour of await prisma.tour.findMany()) {
    const brand = brands.get(tour.brand) ?? await upsertThuongHieu(tour.brand)
    const field = linhVucs.get(tour.type) ?? await upsertLinhVuc(typeToCatalog[tour.type])
    await prisma.tour.update({ where: { id: tour.id }, data: { thuongHieuId: brand.id, linhVucId: field.id } })
  }
  console.log(`✅ Seed xong: ${await prisma.tour.count()} tour, ${await prisma.thuongHieu.count()} thương hiệu, ${await prisma.linhVuc.count()} lĩnh vực`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
