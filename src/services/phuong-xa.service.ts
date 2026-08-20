import { AppError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';
import * as khuVucRepository from '@/repositories/khu-vuc.repository';
import * as phuongXaRepository from '@/repositories/phuong-xa.repository';

export async function listPhuongXa(khuVucId?: string) {
  return phuongXaRepository.listPhuongXa(khuVucId);
}

export async function getPhuongXa(id: string) {
  const item = await phuongXaRepository.findPhuongXaById(id);
  if (!item) throw new AppError('Phường/xã không tồn tại', 'PHUONGXA_NOT_FOUND', 404);
  return item;
}

export async function createPhuongXa(khuVucId: string, name: string) {
  const normalized = normalizeText(name);
  if (!normalized) throw new AppError('Tên phường/xã không được để trống', 'PHUONGXA_NAME_REQUIRED');
  const khuVuc = await khuVucRepository.findKhuVucById(khuVucId);
  if (!khuVuc) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  const existing = await phuongXaRepository.findPhuongXaByNameInKhuVuc(khuVucId, normalized);
  if (existing) throw new AppError('Tên phường/xã đã tồn tại trong khu vực này', 'PHUONGXA_DUPLICATE');
  return phuongXaRepository.createPhuongXa(khuVucId, normalized);
}

export async function updatePhuongXa(id: string, data: { name: string; khuVucId: string }) {
  const normalized = normalizeText(data.name);
  if (!normalized) throw new AppError('Tên phường/xã không được để trống', 'PHUONGXA_NAME_REQUIRED');
  const current = await phuongXaRepository.findPhuongXaById(id);
  if (!current) throw new AppError('Phường/xã không tồn tại', 'PHUONGXA_NOT_FOUND', 404);
  const branchCount = await phuongXaRepository.countPhuongXaBranches(id);
  if (branchCount > 0 && current.khuVucId !== data.khuVucId) {
    throw new AppError('Không thể chuyển phường/xã đang được chi nhánh sử dụng sang khu vực khác', 'PHUONGXA_MOVE_BLOCKED');
  }
  const khuVuc = await khuVucRepository.findKhuVucById(data.khuVucId);
  if (!khuVuc) throw new AppError('Khu vực không tồn tại', 'KHUVUC_NOT_FOUND', 404);
  const existing = await phuongXaRepository.findPhuongXaByNameInKhuVuc(data.khuVucId, normalized);
  if (existing && existing.id !== id) {
    throw new AppError('Tên phường/xã đã tồn tại trong khu vực này', 'PHUONGXA_DUPLICATE');
  }
  return phuongXaRepository.updatePhuongXa(id, { name: normalized, khuVucId: data.khuVucId });
}

export async function deletePhuongXa(id: string) {
  const current = await phuongXaRepository.findPhuongXaById(id);
  if (!current) throw new AppError('Phường/xã không tồn tại', 'PHUONGXA_NOT_FOUND', 404);
  const branchCount = await phuongXaRepository.countPhuongXaBranches(id);
  if (branchCount > 0) {
    throw new AppError('Không thể xóa phường/xã đang được chi nhánh sử dụng', 'PHUONGXA_HAS_DEPENDENCY');
  }
  await phuongXaRepository.deletePhuongXa(id);
}
