import { UserRole } from '@prisma/client';

export const PERMISSIONS = {
  bling: {
    read: [],
    write: [UserRole.USER],
  },
  dashboard: {
    read: [],
    write: [],
  },
  products: {
    read: [],
    write: [],
  },
  campaign: {
    read: [],
    write: [],
  },
  users: {
    read: [UserRole.SUPER_ADMIN],
    write: [UserRole.SUPER_ADMIN],
  },
  profile: {
    read: [],
    write: [],
  },
};
