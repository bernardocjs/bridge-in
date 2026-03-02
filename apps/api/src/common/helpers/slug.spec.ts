import { describe, expect, it } from 'vitest';
import { generateSlug, rotateSlugSuffix } from './slug';

describe('generateSlug', () => {
  it('should generate slug in name-suffix format', () => {
    const slug = generateSlug('Acme Corp');
    expect(slug).toMatch(/^acme-corp-[a-z0-9]{6}$/);
  });

  it('should strip accents and special characters', () => {
    const slug = generateSlug('Açaí & Café Corp.');
    expect(slug).toMatch(/^acai-cafe-corp-[a-z0-9]{6}$/);
  });

  it('should truncate long names without cutting mid-word', () => {
    const longName =
      'A'.repeat(20) + ' ' + 'B'.repeat(20) + ' ' + 'C'.repeat(20);
    const slug = generateSlug(longName);
    const prefix = slug.slice(0, slug.lastIndexOf('-'));
    expect(prefix.length).toBeLessThanOrEqual(40);
    expect(slug).toMatch(/[a-z0-9]{6}$/);
  });

  it('should generate unique slugs on each call', () => {
    const slugs = new Set(
      Array.from({ length: 20 }, () => generateSlug('Test')),
    );
    expect(slugs.size).toBe(20);
  });

  it('should handle extra spaces and hyphens', () => {
    const slug = generateSlug('  My   Cool  Company  ');
    expect(slug).toMatch(/^my-cool-company-[a-z0-9]{6}$/);
  });

  it('should handle numbers in the name', () => {
    const slug = generateSlug('Company 42');
    expect(slug).toMatch(/^company-42-[a-z0-9]{6}$/);
  });
});

describe('rotateSlugSuffix', () => {
  it('should keep the prefix and replace only the suffix', () => {
    const original = 'acme-corp-abc123';
    const rotated = rotateSlugSuffix(original);

    expect(rotated).toMatch(/^acme-corp-[a-z0-9]{6}$/);
    expect(rotated).not.toBe(original);
  });

  it('should generate a different suffix each time', () => {
    const original = 'acme-corp-abc123';
    const results = new Set(
      Array.from({ length: 20 }, () => rotateSlugSuffix(original)),
    );
    for (const slug of results) {
      expect(slug.startsWith('acme-corp-')).toBe(true);
    }
    expect(results.size).toBe(20);
  });

  it('should handle slug without hyphens (fallback)', () => {
    const rotated = rotateSlugSuffix('nohyphens');
    expect(rotated).toMatch(/^nohyphens-[a-z0-9]{6}$/);
  });

  it('should handle slug with leading hyphen only (fallback)', () => {
    const rotated = rotateSlugSuffix('-abc123');
    expect(rotated).toMatch(/^-abc123-[a-z0-9]{6}$/);
  });

  it('should preserve prefix with multiple hyphens', () => {
    const original = 'my-cool-company-x7k9m2';
    const rotated = rotateSlugSuffix(original);
    expect(rotated).toMatch(/^my-cool-company-[a-z0-9]{6}$/);
  });
});
