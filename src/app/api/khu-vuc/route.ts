import { fail, ok } from '@/lib/http';
import * as khuVucService from '@/services/khu-vuc.service';

export async function GET() {
  try {
    const data = await khuVucService.listKhuVuc();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await khuVucService.createKhuVuc(String(body.name ?? ''));
    return ok(data, 'Đã tạo khu vực');
  } catch (error) {
    return fail(error);
  }
}
