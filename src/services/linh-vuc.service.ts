import { AppError } from '@/lib/errors';
import { normalizeText } from '@/lib/normalize';
import * as repository from '@/repositories/linh-vuc.repository';

export function listLinhVuc() { return repository.listLinhVuc(); }

export async function createLinhVuc(name: string) {
  if (!normalizeText(name)) throw new AppError('Tên lĩnh vực không được để trống', 'LINHVUC_NAME_REQUIRED');
  return repository.createLinhVuc(name);
}

export async function updateLinhVuc(id: string, name: string) {
  if (!normalizeText(name)) throw new AppError('Tên lĩnh vực không được để trống', 'LINHVUC_NAME_REQUIRED');
  return repository.updateLinhVuc(id, name);
}

export async function deleteLinhVuc(id: string) {
  const current = await repository.findLinhVucById(id);
  if (!current) throw new AppError('Lĩnh vực không tồn tại', 'LINHVUC_NOT_FOUND', 404);
  if (current._count.tours > 0) throw new AppError('Không thể xóa lĩnh vực đang có tour', 'LINHVUC_HAS_DEPENDENCY');
  return repository.deleteLinhVuc(id);
}
