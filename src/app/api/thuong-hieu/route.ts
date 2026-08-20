import { fail, ok } from '@/lib/http';
import * as service from '@/services/thuong-hieu.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return ok(await service.listThuongHieu(searchParams.get('linhVucId') ?? undefined));
  } catch (error) { return fail(error); }
}
export async function POST(request: Request) {
  try { const body = await request.json(); return ok(await service.createThuongHieu(String(body.name ?? ''), body.linhVucId ? String(body.linhVucId) : undefined), 'Đã tạo thương hiệu'); }
  catch (error) { return fail(error); }
}
