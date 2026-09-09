export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeKey(value: string): string {
  return normalizeText(value).toLocaleLowerCase('vi-VN');
}

export function isBasicPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, '');
  return digits.length >= 8 && digits.length <= 15 && /^[\d\s+().-]+$/.test(value);
}

export function isBasicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
