import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import {
  AdjustStockPayload,
  UpdateOrderStatusPayload,
  AddOrderInternalNotePayload,
  ToggleCustomerStatusPayload,
  IssueRefundPayload,
  ModerateReviewPayload,
  ReviewStoreReplyPayload,
  BroadcastNotificationPayload,
  CreateNotificationTemplatePayload,
  TestSendTemplatePayload,
} from '@/types';
import { toast } from 'sonner';

export const DASHBOARD_QUERY_KEYS = {
  KPI_OVERVIEW: (dateFrom?: string, dateTo?: string) => ['dashboard', 'kpi', { dateFrom, dateTo }],
  SALES_CHART: (days: number) => ['dashboard', 'sales-chart', days],
  TOP_PRODUCTS: (limit: number) => ['dashboard', 'top-products', limit],
  TOP_CUSTOMERS: (limit: number) => ['dashboard', 'top-customers', limit],
  INVENTORY: (params?: Record<string, unknown>) => ['dashboard', 'inventory', params],
  LOW_STOCK: (params?: Record<string, unknown>) => ['dashboard', 'inventory', 'low-stock', params],
  INVENTORY_STATS: ['dashboard', 'inventory', 'stats'],
  STOCK_LOGS: (params?: Record<string, unknown>) => ['dashboard', 'inventory', 'logs', params],
  ORDERS: (params?: Record<string, unknown>) => ['dashboard', 'orders', params],
  ORDER_DETAIL: (orderNumber: string) => ['dashboard', 'orders', 'detail', orderNumber],
  ORDER_NOTES: (orderNumber: string) => ['dashboard', 'orders', 'notes', orderNumber],
  CUSTOMERS: (params?: Record<string, unknown>) => ['dashboard', 'customers', params],
  CUSTOMER_DETAIL: (id: number | string) => ['dashboard', 'customers', 'detail', id],
  PAYMENTS: (params?: Record<string, unknown>) => ['dashboard', 'payments', params],
  PAYMENT_DETAIL: (paymentNumber: string) => ['dashboard', 'payments', 'detail', paymentNumber],
  REFUNDS: (params?: Record<string, unknown>) => ['dashboard', 'refunds', params],
  TRANSACTIONS: (params?: Record<string, unknown>) => ['dashboard', 'transactions', params],
  MODERATION_QUEUE: (params?: Record<string, unknown>) => ['dashboard', 'moderation', params],
  EMAIL_QUEUE: (params?: Record<string, unknown>) => ['dashboard', 'emails', params],
  TEMPLATES: (params?: Record<string, unknown>) => ['dashboard', 'templates', params],
  ALERTS: (params?: Record<string, unknown>) => ['dashboard', 'alerts', params],
  AUDIT_LOGS: (params?: Record<string, unknown>) => ['dashboard', 'audit-logs', params],
};

// ==========================================
// 1. Executive Analytics & KPIs Hooks
// ==========================================
export function useKPIOverview(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.KPI_OVERVIEW(dateFrom, dateTo),
    queryFn: () => dashboardApi.getKpiOverview({ date_from: dateFrom, date_to: dateTo }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSalesChart(days: number = 30) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.SALES_CHART(days),
    queryFn: () => dashboardApi.getSalesChart(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TOP_PRODUCTS(limit),
    queryFn: () => dashboardApi.getTopProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopCustomers(limit: number = 10) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TOP_CUSTOMERS(limit),
    queryFn: () => dashboardApi.getTopCustomers(limit),
    staleTime: 1000 * 60 * 5,
  });
}

// ==========================================
// 2. Inventory Hooks
// ==========================================
export function useInventory(params?: {
  page?: number;
  page_size?: number;
  q?: string;
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.INVENTORY(params),
    queryFn: () => dashboardApi.getInventory(params),
  });
}

export function useLowStock(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.LOW_STOCK(params),
    queryFn: () => dashboardApi.getLowStock(params),
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.INVENTORY_STATS,
    queryFn: () => dashboardApi.getInventoryStats(),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: number | string;
      payload: AdjustStockPayload;
    }) => dashboardApi.adjustStock(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'inventory'] });
      toast.success("Ombor qoldig'i muvaffaqiyatli yangilandi");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ombor qoldig'ini yangilab bo'lmadi");
    },
  });
}

export function useStockLogs(params?: {
  page?: number;
  page_size?: number;
  movement_type?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.STOCK_LOGS(params),
    queryFn: () => dashboardApi.getStockLogs(params),
  });
}

// ==========================================
// 3. Orders Hooks
// ==========================================
export function useAdminOrders(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ORDERS(params),
    queryFn: () => dashboardApi.getOrders(params),
  });
}

export function useAdminOrderDetail(orderNumber: string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ORDER_DETAIL(orderNumber),
    queryFn: () => dashboardApi.getOrderDetail(orderNumber),
    enabled: Boolean(orderNumber),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      payload,
    }: {
      orderNumber: string;
      payload: UpdateOrderStatusPayload;
    }) => dashboardApi.updateOrderStatus(orderNumber, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'orders'] });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.ORDER_DETAIL(variables.orderNumber),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'kpi'] });
      toast.success('Buyurtma statusi yangilandi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Statusni o'zgartirib bo'lmadi");
    },
  });
}

export function useOrderNotes(orderNumber: string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ORDER_NOTES(orderNumber),
    queryFn: () => dashboardApi.getOrderNotes(orderNumber),
    enabled: Boolean(orderNumber),
  });
}

export function useAddOrderNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      payload,
    }: {
      orderNumber: string;
      payload: AddOrderInternalNotePayload;
    }) => dashboardApi.addOrderNote(orderNumber, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.ORDER_NOTES(variables.orderNumber),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'orders'] });
      toast.success("Ichki eslatma qo'shildi");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Eslatma qo'shib bo'lmadi");
    },
  });
}

// ==========================================
// 4. Customers CRM Hooks
// ==========================================
export function useCustomers(params?: {
  page?: number;
  page_size?: number;
  q?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.CUSTOMERS(params),
    queryFn: () => dashboardApi.getCustomers(params),
  });
}

export function useCustomerDetail(id: number | string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.CUSTOMER_DETAIL(id),
    queryFn: () => dashboardApi.getCustomerDetail(id),
    enabled: Boolean(id),
  });
}

export function useToggleCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ToggleCustomerStatusPayload;
    }) => dashboardApi.toggleCustomerStatus(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'customers'] });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.CUSTOMER_DETAIL(variables.id),
      });
      toast.success("Mijoz holati muvaffaqiyatli o'zgartirildi");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Mijoz holatini o'zgartirib bo'lmadi");
    },
  });
}

// ==========================================
// 5. Payments & Refunds Hooks
// ==========================================
export function useAdminPayments(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  provider?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.PAYMENTS(params),
    queryFn: () => dashboardApi.getPayments(params),
  });
}

export function useAdminPaymentDetail(paymentNumber: string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.PAYMENT_DETAIL(paymentNumber),
    queryFn: () => dashboardApi.getPaymentDetail(paymentNumber),
    enabled: Boolean(paymentNumber),
  });
}

export function useIssueRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentNumber,
      payload,
    }: {
      paymentNumber: string;
      payload: IssueRefundPayload;
    }) => dashboardApi.issueRefund(paymentNumber, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'refunds'] });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.PAYMENT_DETAIL(variables.paymentNumber),
      });
      toast.success('Mablag muvaffaqiyatli qaytarildi (Refund issued)');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Mablag'ni qaytarib bo'lmadi");
    },
  });
}

export function useAdminRefunds(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.REFUNDS(params),
    queryFn: () => dashboardApi.getRefunds(params),
  });
}

export function useAdminTransactions(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TRANSACTIONS(params),
    queryFn: () => dashboardApi.getTransactions(params),
  });
}

// ==========================================
// 6. Reviews Moderation Hooks
// ==========================================
export function useModerationQueue(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.MODERATION_QUEUE(params),
    queryFn: () => dashboardApi.getModerationQueue(params),
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ModerateReviewPayload;
    }) => dashboardApi.moderateReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'moderation'] });
      toast.success('Sharh moderatsiyasi bajarildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Moderatsiya o'tkazib bo'lmadi");
    },
  });
}

export function useReviewReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ReviewStoreReplyPayload;
    }) => dashboardApi.replyToReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'moderation'] });
      toast.success('Rasmiy javob yuborildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Javob yuborib bo'lmadi");
    },
  });
}

// ==========================================
// 7. Notifications & Broadcast Hooks
// ==========================================
export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (payload: BroadcastNotificationPayload) =>
      dashboardApi.broadcastNotification(payload),
    onSuccess: () => {
      toast.success('Bildirishnoma barcha foydalanuvchilarga yuborildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Xabarnoma yuborib bo'lmadi");
    },
  });
}

export function useEmailQueue(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.EMAIL_QUEUE(params),
    queryFn: () => dashboardApi.getEmailQueue(params),
  });
}

export function useRetryEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => dashboardApi.retryEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'emails'] });
      toast.success('Email qayta yuborishga uzatildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Emailni qayta yuborib bo'lmadi");
    },
  });
}

export function useCancelEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => dashboardApi.cancelEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'emails'] });
      toast.success('Email bekor qilindi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Emailni bekor qilib bo'lmadi");
    },
  });
}

export function useNotificationTemplates(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  type?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TEMPLATES(params),
    queryFn: () => dashboardApi.getTemplates(params),
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotificationTemplatePayload) =>
      dashboardApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'templates'] });
      toast.success('Xabarnoma shabloni yaratildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Shablon yaratib bo'lmadi");
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: Partial<CreateNotificationTemplatePayload>;
    }) => dashboardApi.updateTemplate(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'templates'] });
      toast.success('Shablon muvaffaqiyatli yangilandi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Shablonni yangilab bo'lmadi");
    },
  });
}

export function useTestSendTemplate() {
  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: TestSendTemplatePayload;
    }) => dashboardApi.testSendTemplate(code, payload),
    onSuccess: () => {
      toast.success('Sinov xabari jo\'natildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Sinov xabari yuborib bo'lmadi");
    },
  });
}

// ==========================================
// 8. Alerts & Audit Trail Hooks
// ==========================================
export function useSystemAlerts(params?: {
  page?: number;
  page_size?: number;
  is_resolved?: boolean;
  severity?: string;
  alert_type?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ALERTS(params),
    queryFn: () => dashboardApi.getSystemAlerts(params),
    refetchInterval: 1000 * 30, // Poll every 30 seconds for critical alerts
  });
}

export function useResolveSystemAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => dashboardApi.resolveSystemAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
      toast.success('Ogohlantirish bartaraf etilgan deb belgilandi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ogohlantirishni yangilab bo'lmadi");
    },
  });
}

export function useStaffAuditLogs(params?: {
  page?: number;
  page_size?: number;
  module?: string;
  action?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.AUDIT_LOGS(params),
    queryFn: () => dashboardApi.getStaffAuditLogs(params),
  });
}
