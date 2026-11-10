'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { Permission, ROLE_PERMISSIONS } from './roles';

export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();

  const userRole = (user?.role || (user?.is_staff ? 'staff' : 'customer')).toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || Boolean(user?.is_staff);

  const can = (permission: Permission): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isSuperAdmin) return true;

    const granted = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[user?.role || ''] || [];
    return granted.includes(permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p));
  };

  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every((p) => can(p));
  };

  return {
    user,
    userRole,
    isSuperAdmin,
    can,
    canAny,
    canAll,
  };
}
