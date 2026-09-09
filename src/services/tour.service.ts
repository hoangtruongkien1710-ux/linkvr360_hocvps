import { TourType } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { isBasicPhone, isBasicUrl, normalizeText } from '@/lib/normalize';
import * as khuVucRepository from '@/repositories/khu-vuc.repository';
import * as phuongXaRepository from '@/repositories/phuong-xa.repository';
import * as tourRepository from '@/repositories/tour.repository';
import * as thuongHieuRepository from '@/repositories/thuong-hieu.repository';
import * as linhVucRepository from '@/repositories/linh-vuc.repository';
import type { BranchInput } from '@/repositories/tour.repository';

const TOUR_STATUSES = ['Đang hoạt động', 'Tạm ngưng'] as const;
const TOUR_TYPES = ['RESTAURANT', 'HOTEL', 'CAFE', 'SPA', 'BOAT', 'OTHER'] as const;

export type TourPayload = { brand?: string; type?: TourType | string; thuongHieuId: string; linhVucId: string; khuVucId: string; url: string; status?: string; chiNhanhs: BranchInput[] };

function assertTourType(value: string): TourType {
  if (!TOUR_TYPES.includes(value as (typeof TOUR_TYPES)[number])) throw new AppError('Lĩnh vực tour không hợp lệ', 'TOUR_TYPE_INVALID');
  return value as TourType;
}
function assertStatus(value?: string) {
  const status = value ?? 'Đang hoạt động';
  if (!TOUR_STATUSES.includes(status as (typeof TOUR_STATUSES)[number])) throw new AppError('Trạng thái tour không hợp lệ', 'TOUR_STATUS_INVALID');
  return status;
}

async function validateTourPayload(payload: TourPayload) {
  const url = normalizeText(payload.url);
  const status = assertStatus(payload.status);
  if (!payload.thuongHieuId) throw new AppError('Thương hiệu không được để trống', 'TOUR_BRAND_REQUIRED');
  if (!payload.linhVucId) throw new AppError('Lĩnh vực không được để trống', 'TOUR_TYPE_INVALID');
  if (!payload.khuVucId) throw new AppError('Khu vực không được để trống', 'TOUR_KHUVUC_REQUIRED');
  if (!isBasicUrl(url)) throw new AppError('Link VR360 không hợp lệ', 'TOUR_URL_INVALID');
  if (!payload.chiNhanhs?.length) throw new AppError('Tour phải có ít nhất một chi nhánh', 'TOUR_BRANCH_REQUIRED');
  const [brand, field, khuVuc] = await Promise.all([
    thuongHieuRepository.findThuongHieuById(payload.thuongHieuId),
    linhVucRepository.findLinhVucById(payload.linhVucId),
    khuVucRepository.findKhuVucById(payload.khuVucId),
  ]);
  if (!brand) throw new AppError('Thương hiệu không tồn tại', 'THUONGHIEU_NOT_FOUND', 404);
  if (!field) throw new AppError('Lĩnh vực không tồn tại', 'LINHVUC_NOT_FOUND', 404);
  if (!khuVuc) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  const phuongXas = await phuongXaRepository.findPhuongXasByIds(payload.chiNhanhs.map((item) => item.phuongXaId));
  const phuongXaMap = new Map(phuongXas.map((item) => [item.id, item]));
  const names = new Set<string>();
  const chiNhanhs = payload.chiNhanhs.map((branch, index) => {
    const name = normalizeText(branch.name);
    if (!name) throw new AppError(`Tên chi nhánh thứ ${index + 1} không được để trống`, 'BRANCH_NAME_REQUIRED');
    const key = name.toLocaleLowerCase('vi-VN');
    if (names.has(key)) throw new AppError('Tên chi nhánh trong cùng một tour không được trùng', 'BRANCH_DUPLICATE');
    names.add(key);
    const ward = phuongXaMap.get(branch.phuongXaId);
    if (!ward) throw new AppError(`Phường/xã của chi nhánh "${name}" không tồn tại`, 'PHUONGXA_NOT_FOUND', 404);
    if (ward.khuVucId !== payload.khuVucId) throw new AppError(`Chi nhánh "${name}" phải chọn phường/xã thuộc khu vực của tour`, 'BRANCH_WARD_MISMATCH');
    const soDienThoai = branch.soDienThoai ? normalizeText(branch.soDienThoai) : null;
    if (soDienThoai && !isBasicPhone(soDienThoai)) throw new AppError(`Số điện thoại của chi nhánh "${name}" không hợp lệ`, 'BRANCH_PHONE_INVALID');
    return { name, phuongXaId: branch.phuongXaId, diaChi: branch.diaChi ? normalizeText(branch.diaChi) : null, soDienThoai };
  });
  return { brand: brand.name, type: assertTourType(payload.type ?? 'OTHER'), thuongHieuId: brand.id, linhVucId: field.id, khuVucId: payload.khuVucId, url, status, chiNhanhs };
}
export function listTours(filters?: { search?: string; khuVucId?: string; phuongXaId?: string; status?: string; thuongHieuId?: string; linhVucId?: string }) {
  return tourRepository.listTours(filters);
}
export async function getTour(id: string) { const tour = await tourRepository.findTourById(id); if (!tour) throw new AppError('Tour không tồn tại', 'TOUR_NOT_FOUND', 404); return tour; }
export async function createTour(payload: TourPayload) { return tourRepository.createTour(await validateTourPayload(payload)); }
export async function updateTour(id: string, payload: TourPayload) { if (!await tourRepository.findTourById(id)) throw new AppError('Tour không tồn tại', 'TOUR_NOT_FOUND', 404); return tourRepository.updateTour(id, await validateTourPayload(payload)); }
export async function deleteTour(id: string) { if (!await tourRepository.findTourById(id)) throw new AppError('Tour không tồn tại', 'TOUR_NOT_FOUND', 404); await tourRepository.deleteTour(id); }
