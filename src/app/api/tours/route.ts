import { fail, ok } from '@/lib/http';
import * as tourService from '@/services/tour.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await tourService.listTours({
      search: searchParams.get('search') ?? undefined,
      khuVucId: searchParams.get('khuVucId') ?? undefined,
      phuongXaId: searchParams.get('phuongXaId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      thuongHieuId: searchParams.get('thuongHieuId') ?? undefined,
      linhVucId: searchParams.get('linhVucId') ?? undefined,
    });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await tourService.createTour(body);
    return ok(data, 'Đã tạo tour');
  } catch (error) {
    return fail(error);
  }
}
