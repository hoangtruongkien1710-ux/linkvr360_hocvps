import { fail, ok } from '@/lib/http';
import * as service from '@/services/linh-vuc.service';

export async function GET() { try { return ok(await service.listLinhVuc()); } catch (error) { return fail(error); } }
export async function POST(request: Request) {
  try { const body = await request.json(); return ok(await service.createLinhVuc(String(body.name ?? '')), 'Đã tạo lĩnh vực'); }
  catch (error) { return fail(error); }
}
