import { UserRole } from '@prisma/client';

export const PERMISSIONS = {
  dashboard: {
    read: [],
    write: [],
  },
  campaign: {
    read: [],
    write: [UserRole.USER],
  },
  bling: {
    read: [],
    write: [UserRole.USER],
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
