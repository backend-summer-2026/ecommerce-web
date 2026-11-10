import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useCartStore } from '@/features/cart/store/cartStore';
import type {
  CheckoutPreviewInput,
  OrderCreatePayload,
} from '@/types/orders';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: { status?: string; page?: number }) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderNumber: string) => [...orderKeys.details(), orderNumber] as const,
  tracking: (orderNumber: string) => [...orderKeys.all, 'tracking', orderNumber] as const,
  invoice: (orderNumber: string) => [...orderKeys.all, 'invoice', orderNumber] as const,
  preview: (params: CheckoutPreviewInput) => [...orderKeys.all, 'preview', params] as const,
};

export function useCheckoutPreview(input: CheckoutPreviewInput, enabled: boolean = true) {
  return useQuery({
    queryKey: orderKeys.preview(input),
    queryFn: () => ordersApi.previewCheckout(input),
    enabled,
    staleTime: 10 * 1000,
  });
}

export function useOrders(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 30 * 1000,
  });
}

export function useOrderDetail(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => ordersApi.getOrderDetail(orderNumber),
    enabled: !!orderNumber,
    staleTime: 30 * 1000,
  });
}

export function useOrderTracking(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.tracking(orderNumber),
    queryFn: () => ordersApi.getOrderTracking(orderNumber),
    enabled: !!orderNumber,
    staleTime: 30 * 1000,
  });
}

export function useOrderInvoice(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.invoice(orderNumber),
    queryFn: () => ordersApi.getOrderInvoice(orderNumber),
    enabled: !!orderNumber,
    staleTime: 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { fetchCart, fetchCartCount } = useCartStore();

  return useMutation({
    mutationFn: (payload: OrderCreatePayload) => ordersApi.createOrder(payload),
    onSuccess: () => {
      // Yangi buyurtma yaratilgandan so'ng keshni tozalash va savatchani yangilash
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      fetchCart();
      fetchCartCount();
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderNumber, reason }: { orderNumber: string; reason?: string }) =>
      ordersApi.cancelOrder(orderNumber, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order_number) });
      queryClient.invalidateQueries({ queryKey: orderKeys.tracking(data.order_number) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
