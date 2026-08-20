import { AppError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';
import * as repository from '@/repositories/thuong-hieu.repository';

export function listThuongHieu(linhVucId?: string) { return repository.listThuongHieu(linhVucId); }

export async function createThuongHieu(name: string, linhVucId?: string) {
  if (!normalizeText(name)) throw new AppError('Tên thương hiệu không được để trống', 'THUONGHIEU_NAME_REQUIRED');
  return repository.createThuongHieu(name, linhVucId);
}

export async function updateThuongHieu(id: string, name: string) {
  if (!normalizeText(name)) throw new AppError('Tên thương hiệu không được để trống', 'THUONGHIEU_NAME_REQUIRED');
  return repository.updateThuongHieu(id, name);
}

export async function deleteThuongHieu(id: string) {
  const current = await repository.findThuongHieuById(id);
  if (!current) throw new AppError('Thương hiệu không tồn tại', 'THUONGHIEU_NOT_FOUND', 404);
  if (current._count.tours > 0) throw new AppError('Không thể xóa thương hiệu đang có tour', 'THUONGHIEU_HAS_DEPENDENCY');
  return repository.deleteThuongHieu(id);
}