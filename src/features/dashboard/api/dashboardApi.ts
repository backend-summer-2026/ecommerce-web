import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import {
  PaginatedResponse,
  ExecutiveKPIOverview,
  SalesChartPoint,
  TopProduct,
  TopCustomer,
  DashboardInventoryItem,
  InventoryOverviewStats,
  AdjustStockPayload,
  StockMovementLog,
  DashboardOrderListItem,
  DashboardOrderDetail,
  UpdateOrderStatusPayload,
  OrderInternalNote,
  AddOrderInternalNotePayload,
  DashboardCustomerListItem,
  DashboardCustomerDetail,
  ToggleCustomerStatusPayload,
  AdminPaymentListItem,
  AdminPaymentDetail,
  IssueRefundPayload,
  AdminRefundItem,
  AdminTransactionLog,
  ModerateReviewPayload,
  ReviewStoreReplyPayload,
  BroadcastNotificationPayload,
  EmailQueueItem,
  NotificationTemplate,
  CreateNotificationTemplatePayload,
  TestSendTemplatePayload,
  SystemAlert,
  StaffActivityLog,
} from '@/types';
import { ReviewItem } from '@/types/reviews';

export const dashboardApi = {
  // ==========================================
  // 1. Executive Analytics & KPIs
  // ==========================================
  async getKpiOverview(params?: { date_from?: string; date_to?: string }): Promise<ExecutiveKPIOverview> {
    const response = await apiClient.get<ExecutiveKPIOverview>(
      API_ENDPOINTS.DASHBOARD.ANALYTICS.OVERVIEW,
      { params }
    );
    return response.data;
  },

  async getSalesChart(days: number = 30): Promise<SalesChartPoint[]> {
    const response = await apiClient.get<SalesChartPoint[]>(
      API_ENDPOINTS.DASHBOARD.ANALYTICS.SALES_CHART,
      { params: { days } }
    );
    return response.data;
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await apiClient.get<TopProduct[]>(
      API_ENDPOINTS.DASHBOARD.ANALYTICS.TOP_PRODUCTS,
      { params: { limit } }
    );
    return response.data;
  },

  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    const response = await apiClient.get<TopCustomer[]>(
      API_ENDPOINTS.DASHBOARD.ANALYTICS.TOP_CUSTOMERS,
      { params: { limit } }
    );
    return response.data;
  },

  // ==========================================
  // 2. Inventory & Stock Management
  // ==========================================
  async getInventory(params?: {
    page?: number;
    page_size?: number;
    q?: string;
    is_low_stock?: boolean;
    is_out_of_stock?: boolean;
  }): Promise<PaginatedResponse<DashboardInventoryItem>> {
    const response = await apiClient.get<PaginatedResponse<DashboardInventoryItem>>(
      API_ENDPOINTS.DASHBOARD.INVENTORY.LIST,
      { params }
    );
    return response.data;
  },

  async getLowStock(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<DashboardInventoryItem>> {
    const response = await apiClient.get<PaginatedResponse<DashboardInventoryItem>>(
      API_ENDPOINTS.DASHBOARD.INVENTORY.LOW_STOCK,
      { params }
    );
    return response.data;
  },

  async getInventoryStats(): Promise<InventoryOverviewStats> {
    const response = await apiClient.get<InventoryOverviewStats>(
      API_ENDPOINTS.DASHBOARD.INVENTORY.STATS
    );
    return response.data;
  },

  async adjustStock(
    variantId: number | string,
    payload: AdjustStockPayload
  ): Promise<DashboardInventoryItem> {
    const response = await apiClient.patch<DashboardInventoryItem>(
      API_ENDPOINTS.DASHBOARD.INVENTORY.ADJUST(variantId),
      payload
    );
    return response.data;
  },

  async getStockLogs(params?: {
    page?: number;
    page_size?: number;
    movement_type?: string;
  }): Promise<PaginatedResponse<StockMovementLog>> {
    const response = await apiClient.get<PaginatedResponse<StockMovementLog>>(
      API_ENDPOINTS.DASHBOARD.INVENTORY.LOGS,
      { params }
    );
    return response.data;
  },

  // ==========================================
  // 3. Orders Management & Notes
  // ==========================================
  async getOrders(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    q?: string;
  }): Promise<PaginatedResponse<DashboardOrderListItem>> {
    const response = await apiClient.get<PaginatedResponse<DashboardOrderListItem>>(
      API_ENDPOINTS.DASHBOARD.ORDERS.LIST,
      { params }
    );
    return response.data;
  },

  async getOrderDetail(orderNumber: string): Promise<DashboardOrderDetail> {
    const response = await apiClient.get<DashboardOrderDetail>(
      API_ENDPOINTS.DASHBOARD.ORDERS.DETAIL(orderNumber)
    );
    return response.data;
  },

  async updateOrderStatus(
    orderNumber: string,
    payload: UpdateOrderStatusPayload
  ): Promise<DashboardOrderDetail> {
    const response = await apiClient.patch<DashboardOrderDetail>(
      API_ENDPOINTS.DASHBOARD.ORDERS.STATUS(orderNumber),
      payload
    );
    return response.data;
  },

  async getOrderNotes(orderNumber: string): Promise<OrderInternalNote[]> {
    const response = await apiClient.get<OrderInternalNote[]>(
      API_ENDPOINTS.DASHBOARD.ORDERS.NOTES(orderNumber)
    );
    return response.data;
  },

  async addOrderNote(
    orderNumber: string,
    payload: AddOrderInternalNotePayload
  ): Promise<OrderInternalNote> {
    const response = await apiClient.post<OrderInternalNote>(
      API_ENDPOINTS.DASHBOARD.ORDERS.NOTES(orderNumber),
      payload
    );
    return response.data;
  },

  // ==========================================
  // 4. Customer CRM & Status
  // ==========================================
  async getCustomers(params?: {
    page?: number;
    page_size?: number;
    q?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<DashboardCustomerListItem>> {
    const response = await apiClient.get<PaginatedResponse<DashboardCustomerListItem>>(
      API_ENDPOINTS.DASHBOARD.CUSTOMERS.LIST,
      { params }
    );
    return response.data;
  },

  async getCustomerDetail(id: number | string): Promise<DashboardCustomerDetail> {
    const response = await apiClient.get<DashboardCustomerDetail>(
      API_ENDPOINTS.DASHBOARD.CUSTOMERS.DETAIL(id)
    );
    return response.data;
  },

  async toggleCustomerStatus(
    id: number | string,
    payload: ToggleCustomerStatusPayload
  ): Promise<DashboardCustomerDetail> {
    const response = await apiClient.patch<DashboardCustomerDetail>(
      API_ENDPOINTS.DASHBOARD.CUSTOMERS.TOGGLE_STATUS(id),
      payload
    );
    return response.data;
  },

  // ==========================================
  // 5. Payments & Refunds
  // ==========================================
  async getPayments(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    provider?: string;
  }): Promise<PaginatedResponse<AdminPaymentListItem>> {
    const response = await apiClient.get<PaginatedResponse<AdminPaymentListItem>>(
      API_ENDPOINTS.PAYMENTS.ADMIN.LIST,
      { params }
    );
    return response.data;
  },

  async getPaymentDetail(paymentNumber: string): Promise<AdminPaymentDetail> {
    const response = await apiClient.get<AdminPaymentDetail>(
      API_ENDPOINTS.PAYMENTS.ADMIN.DETAIL(paymentNumber)
    );
    return response.data;
  },

  async issueRefund(
    paymentNumber: string,
    payload: IssueRefundPayload
  ): Promise<AdminRefundItem> {
    const response = await apiClient.post<AdminRefundItem>(
      API_ENDPOINTS.PAYMENTS.ADMIN.REFUND(paymentNumber),
      payload
    );
    return response.data;
  },

  async getRefunds(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<AdminRefundItem>> {
    const response = await apiClient.get<PaginatedResponse<AdminRefundItem>>(
      API_ENDPOINTS.PAYMENTS.ADMIN.REFUNDS_LIST,
      { params }
    );
    return response.data;
  },

  async getTransactions(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<AdminTransactionLog>> {
    const response = await apiClient.get<PaginatedResponse<AdminTransactionLog>>(
      API_ENDPOINTS.PAYMENTS.ADMIN.TRANSACTIONS,
      { params }
    );
    return response.data;
  },

  // ==========================================
  // 6. Reviews Moderation
  // ==========================================
  async getModerationQueue(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<ReviewItem>> {
    const response = await apiClient.get<PaginatedResponse<ReviewItem>>(
      API_ENDPOINTS.REVIEWS.ADMIN.MODERATION,
      { params }
    );
    return response.data;
  },

  async moderateReview(
    id: number | string,
    payload: ModerateReviewPayload
  ): Promise<ReviewItem> {
    const response = await apiClient.post<ReviewItem>(
      API_ENDPOINTS.REVIEWS.ADMIN.MODERATE(id),
      payload
    );
    return response.data;
  },

  async replyToReview(
    id: number | string,
    payload: ReviewStoreReplyPayload
  ): Promise<ReviewItem> {
    const response = await apiClient.post<ReviewItem>(
      API_ENDPOINTS.REVIEWS.REPLY(id),
      payload
    );
    return response.data;
  },

  // ==========================================
  // 7. Notifications, Broadcast & Email Queue
  // ==========================================
  async broadcastNotification(
    payload: BroadcastNotificationPayload
  ): Promise<{ message: string; count?: number }> {
    const response = await apiClient.post<{ message: string; count?: number }>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.BROADCAST,
      payload
    );
    return response.data;
  },

  async getEmailQueue(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    priority?: string;
    q?: string;
  }): Promise<PaginatedResponse<EmailQueueItem>> {
    const response = await apiClient.get<PaginatedResponse<EmailQueueItem>>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.EMAILS_QUEUE,
      { params }
    );
    return response.data;
  },

  async retryEmail(id: number | string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.RETRY_EMAIL(id)
    );
    return response.data;
  },

  async cancelEmail(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.CANCEL_EMAIL(id)
    );
    return response.data;
  },

  async getTemplates(params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
    type?: string;
  }): Promise<PaginatedResponse<NotificationTemplate>> {
    const response = await apiClient.get<PaginatedResponse<NotificationTemplate>>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.TEMPLATES,
      { params }
    );
    return response.data;
  },

  async createTemplate(
    payload: CreateNotificationTemplatePayload
  ): Promise<NotificationTemplate> {
    const response = await apiClient.post<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.TEMPLATES,
      payload
    );
    return response.data;
  },

  async updateTemplate(
    code: string,
    payload: Partial<CreateNotificationTemplatePayload>
  ): Promise<NotificationTemplate> {
    const response = await apiClient.patch<NotificationTemplate>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.TEMPLATE_DETAIL(code),
      payload
    );
    return response.data;
  },

  async testSendTemplate(
    code: string,
    payload: TestSendTemplatePayload
  ): Promise<{ template_code: string; message?: string }> {
    const response = await apiClient.post<{ template_code: string; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN.TEST_SEND(code),
      payload
    );
    return response.data;
  },

  // ==========================================
  // 8. Alerts & Audit Trail
  // ==========================================
  async getSystemAlerts(params?: {
    page?: number;
    page_size?: number;
    is_resolved?: boolean;
    severity?: string;
    alert_type?: string;
  }): Promise<PaginatedResponse<SystemAlert>> {
    const response = await apiClient.get<PaginatedResponse<SystemAlert>>(
      API_ENDPOINTS.DASHBOARD.AUDIT.ALERTS,
      { params }
    );
    return response.data;
  },

  async resolveSystemAlert(id: number | string): Promise<SystemAlert> {
    const response = await apiClient.patch<SystemAlert>(
      API_ENDPOINTS.DASHBOARD.AUDIT.RESOLVE_ALERT(id)
    );
    return response.data;
  },

  async getStaffAuditLogs(params?: {
    page?: number;
    page_size?: number;
    module?: string;
    action?: string;
    q?: string;
  }): Promise<PaginatedResponse<StaffActivityLog>> {
    const response = await apiClient.get<PaginatedResponse<StaffActivityLog>>(
      API_ENDPOINTS.DASHBOARD.AUDIT.LOGS,
      { params }
    );
    return response.data;
  },
};
