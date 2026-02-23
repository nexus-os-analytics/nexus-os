import { UserRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { getPermissions } from '../auth.utils';

describe('getPermissions', () => {
  it('returns empty array for invalid path', () => {
    expect(getPermissions('invalid' as 'dashboard.read')).toEqual([]);
    expect(getPermissions('unknown.nested.path' as 'dashboard.read')).toEqual([]);
  });

  it('returns empty array for path that does not resolve to array', () => {
    // Path that goes one level deep but not to a leaf array
    expect(getPermissions('bling' as 'dashboard.read')).toEqual([]);
  });

  it('returns roles for users.read and users.write', () => {
    expect(getPermissions('users.read')).toEqual([UserRole.SUPER_ADMIN]);
    expect(getPermissions('users.write')).toEqual([UserRole.SUPER_ADMIN]);
  });

  it('returns roles for payments.read and payments.write', () => {
    expect(getPermissions('payments.read')).toEqual([UserRole.SUPER_ADMIN]);
    expect(getPermissions('payments.write')).toEqual([UserRole.SUPER_ADMIN]);
  });

  it('returns roles for bling.write', () => {
    expect(getPermissions('bling.write')).toEqual([UserRole.USER]);
  });

  it('returns empty array for paths with no restricted roles', () => {
    expect(getPermissions('dashboard.read')).toEqual([]);
    expect(getPermissions('dashboard.write')).toEqual([]);
    expect(getPermissions('profile.read')).toEqual([]);
    expect(getPermissions('campaign.read')).toEqual([]);
    expect(getPermissions('products.read')).toEqual([]);
  });

  it('dashboard.read has no restricted roles (regression)', () => {
    const roles = getPermissions('dashboard.read');
    expect(Array.isArray(roles)).toBe(true);
    expect(roles).toEqual([]);
  });
});
