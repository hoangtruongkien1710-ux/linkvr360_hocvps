import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export function ok<T>(data: T, message = '') {
  return NextResponse.json({ ok: true, data, message, error: null });
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { ok: false, data: null, message: error.message, error: error.code },
      { status: error.statusCode },
    );
  }
  console.error(error);
  return NextResponse.json(
    { ok: false, data: null, message: 'Có lỗi xảy ra, vui lòng thử lại', error: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}
