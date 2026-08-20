import { fail, ok } from '@/lib/http';
import * as phuongXaService from '@/services/phuong-xa.service';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await phuongXaService.updatePhuongXa(id, {
      name: String(body.name ?? ''),
      khuVucId: String(body.khuVucId ?? ''),
    });
    return ok(data, 'Đã cập nhật phường/xã');
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await phuongXaService.deletePhuongXa(id);
    return ok(null, 'Đã xóa phường/xã');
  } catch (error) {
    return fail(error);
  }
}
