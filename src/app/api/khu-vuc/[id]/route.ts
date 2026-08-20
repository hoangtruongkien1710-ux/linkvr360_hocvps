import { fail, ok } from '@/lib/http';
import * as khuVucService from '@/services/khu-vuc.service';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await khuVucService.updateKhuVuc(id, String(body.name ?? ''));
    return ok(data, 'Đã cập nhật khu vực');
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await khuVucService.deleteKhuVuc(id);
    return ok(null, 'Đã xóa khu vực');
  } catch (error) {
    return fail(error);
  }
}
