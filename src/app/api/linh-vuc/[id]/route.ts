import { fail, ok } from '@/lib/http';
import * as service from '@/services/linh-vuc.service';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try { const { id } = await params; const body = await request.json(); return ok(await service.updateLinhVuc(id, String(body.name ?? '')), 'Đã cập nhật lĩnh vực'); }
  catch (error) { return fail(error); }
}

export async function DELETE(_request: Request, { params }: Params) {
  try { const { id } = await params; await service.deleteLinhVuc(id); return ok(null, 'Đã xóa lĩnh vực'); }
  catch (error) { return fail(error); }
}
