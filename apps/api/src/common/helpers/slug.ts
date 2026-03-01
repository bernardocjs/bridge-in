import { randomBytes } from 'crypto';

const SUFFIX_LENGTH = 6;
const MAX_PREFIX_LENGTH = 40;
const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomSuffix(length = SUFFIX_LENGTH): string {
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return result;
}

function slugifyName(name: string): string {
  let slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > MAX_PREFIX_LENGTH) {
    slug = slug.slice(0, MAX_PREFIX_LENGTH);
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 0) {
      slug = slug.slice(0, lastHyphen);
    }
  }

  return slug || 'company';
}

export function generateSlug(name: string): string {
  return `${slugifyName(name)}-${randomSuffix()}`;
}

export function rotateSlugSuffix(currentSlug: string): string {
  const prefixEnd = currentSlug.lastIndexOf('-');

  if (prefixEnd <= 0) {
    return `${currentSlug}-${randomSuffix()}`;
  }

  const prefix = currentSlug.slice(0, prefixEnd);
  return `${prefix}-${randomSuffix()}`;
}
