import { fail, ok } from '@/lib/http';
import * as phuongXaService from '@/services/phuong-xa.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await phuongXaService.listPhuongXa(searchParams.get('khuVucId') ?? undefined);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await phuongXaService.createPhuongXa(String(body.khuVucId ?? ''), String(body.name ?? ''));
    return ok(data, 'Đã tạo phường/xã');
  } catch (error) {
    return fail(error);
  }
}
