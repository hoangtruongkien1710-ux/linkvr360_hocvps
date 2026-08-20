import { fail, ok } from '@/lib/http';
import * as tourService from '@/services/tour.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await tourService.getTour(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await tourService.updateTour(id, body);
    return ok(data, 'Đã cập nhật tour');
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await tourService.deleteTour(id);
    return ok(null, 'Đã xóa tour');
  } catch (error) {
    return fail(error);
  }
}
