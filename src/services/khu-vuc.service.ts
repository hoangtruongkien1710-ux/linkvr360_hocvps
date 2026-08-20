import { AppError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';
import * as khuVucRepository from '@/repositories/khu-vuc.repository';

export async function listKhuVuc() {
  return khuVucRepository.listKhuVuc();
}

export async function getKhuVuc(id: string) {
  const khuVuc = await khuVucRepository.findKhuVucById(id);
  if (!khuVuc) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  return khuVuc;
}

export async function createKhuVuc(name: string) {
  const normalized = normalizeText(name);
  if (!normalized) throw new AppError('Tên khu vực không được để trống', 'KHUVUC_NAME_REQUIRED');
  const existing = await khuVucRepository.findKhuVucByNormalizedName(normalized);
  if (existing) throw new AppError('Tên khu vực đã tồn tại', 'KHUVUC_DUPLICATE');
  return khuVucRepository.createKhuVuc(normalized);
}

export async function updateKhuVuc(id: string, name: string) {
  const normalized = normalizeText(name);
  if (!normalized) throw new AppError('Tên khu vực không được để trống', 'KHUVUC_NAME_REQUIRED');
  const current = await khuVucRepository.findKhuVucById(id);
  if (!current) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  const existing = await khuVucRepository.findKhuVucByNormalizedName(normalized);
  if (existing && existing.id !== id) throw new AppError('Tên khu vực đã tồn tại', 'KHUVUC_DUPLICATE');
  return khuVucRepository.updateKhuVuc(id, normalized);
}

export async function deleteKhuVuc(id: string) {
  const current = await khuVucRepository.findKhuVucById(id);
  if (!current) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  const deps = await khuVucRepository.countKhuVucDependencies(id);
  if (deps.phuongXaCount > 0 || deps.tourCount > 0) {
    throw new AppError('Không thể xóa khu vực đang có phường/xã hoặc tour liên quan', 'KHUVUC_HAS_DEPENDENCY');
  }
  await khuVucRepository.deleteKhuVuc(id);
}
