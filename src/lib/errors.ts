export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  );
}
