import { fail, ok } from '@/lib/http';
import * as service from '@/services/thuong-hieu.service';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try { const { id } = await params; const body = await request.json(); return ok(await service.updateThuongHieu(id, String(body.name ?? '')), 'Đã cập nhật thương hiệu'); }
  catch (error) { return fail(error); }
}

export async function DELETE(_request: Request, { params }: Params) {
  try { const { id } = await params; await service.deleteThuongHieu(id); return ok(null, 'Đã xóa thương hiệu'); }
  catch (error) { return fail(error); }
}
