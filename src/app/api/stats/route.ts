import { fail, ok } from '@/lib/http';
import * as statsService from '@/services/stats.service';

export async function GET() {
  try {
    const data = await statsService.getStats();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
