export type AdminRole =
  | 'SUPER_ADMIN'
  | 'STORE_MANAGER'
  | 'ORDER_OPERATOR'
  | 'WAREHOUSE_STAFF'
  | 'SUPPORT_AGENT'
  | 'admin'
  | 'staff'
  | string;

export type Permission =
  // Mahsulotlar
  | 'products:view'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  // Ombor & Zaxiralar
  | 'inventory:view'
  | 'inventory:adjust'
  // Buyurtmalar
  | 'orders:view'
  | 'orders:update_status'
  | 'orders:notes'
  // Mijozlar CRM
  | 'customers:view'
  | 'customers:toggle_status'
  // To'lovlar & Qaytarish
  | 'payments:view'
  | 'payments:refund'
  // Sharhlar
  | 'reviews:view'
  | 'reviews:moderate'
  | 'reviews:reply'
  // Xabarnomalar
  | 'notifications:view'
  | 'notifications:broadcast'
  // Tizim Ogohlantirishlari
  | 'alerts:view'
  | 'alerts:resolve'
  // Audit Trail
  | 'audit:view';

/**
 * Rollar va ularning ruxsatnomalar matritsasi
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'products:view', 'products:create', 'products:update', 'products:delete',
    'inventory:view', 'inventory:adjust',
    'orders:view', 'orders:update_status', 'orders:notes',
    'customers:view', 'customers:toggle_status',
    'payments:view', 'payments:refund',
    'reviews:view', 'reviews:moderate', 'reviews:reply',
    'notifications:view', 'notifications:broadcast',
    'alerts:view', 'alerts:resolve',
    'audit:view',
  ],
  admin: [
    'products:view', 'products:create', 'products:update', 'products:delete',
    'inventory:view', 'inventory:adjust',
    'orders:view', 'orders:update_status', 'orders:notes',
    'customers:view', 'customers:toggle_status',
    'payments:view', 'payments:refund',
    'reviews:view', 'reviews:moderate', 'reviews:reply',
    'notifications:view', 'notifications:broadcast',
    'alerts:view', 'alerts:resolve',
    'audit:view',
  ],
  STORE_MANAGER: [
    'products:view', 'products:create', 'products:update',
    'inventory:view', 'inventory:adjust',
    'orders:view', 'orders:update_status', 'orders:notes',
    'customers:view',
    'payments:view', 'payments:refund',
    'reviews:view', 'reviews:moderate', 'reviews:reply',
    'notifications:view', 'notifications:broadcast',
    'alerts:view',
    'audit:view',
  ],
  ORDER_OPERATOR: [
    'products:view',
    'inventory:view',
    'orders:view', 'orders:update_status', 'orders:notes',
    'customers:view',
    'payments:view',
    'reviews:view',
  ],
  WAREHOUSE_STAFF: [
    'products:view',
    'inventory:view', 'inventory:adjust',
    'orders:view',
    'alerts:view',
  ],
  SUPPORT_AGENT: [
    'products:view',
    'orders:view', 'orders:notes',
    'customers:view',
    'reviews:view', 'reviews:reply',
    'notifications:view',
  ],
};
