import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/features/payments/api/paymentsApi';
import type {
  AddCardPayload,
  VerifyCardPayload,
  InitializePaymentPayload,
  PayWithCardPayload,
  CancelPaymentPayload,
} from '@/types/payments';

export const paymentKeys = {
  all: ['payments'] as const,
  cards: () => [...paymentKeys.all, 'cards'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params?: { page?: number }) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (paymentNumber: string) => [...paymentKeys.details(), paymentNumber] as const,
};

/**
 * Saqlangan bank kartalarini yuklash
 */
export function useSavedCards(enabled: boolean = true) {
  return useQuery({
    queryKey: paymentKeys.cards(),
    queryFn: () => paymentsApi.getSavedCards(),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Yangi karta qo'shish mutatsiyasi
 */
export function useAddSavedCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCardPayload) => paymentsApi.addSavedCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
  });
}

/**
 * Karta OTP kodini tasdiqlash mutatsiyasi
 */
export function useVerifyCardOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyCardPayload) => paymentsApi.verifySavedCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
  });
}

/**
 * Kartani asosiy (default) qilib belgilash
 */
export function useSetDefaultCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: number) => paymentsApi.setDefaultCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
  });
}

/**
 * Kartani o'chirish
 */
export function useDeleteSavedCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: number) => paymentsApi.deleteSavedCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
  });
}

/**
 * To'lovni initsializatsiya qilish (Payme, Click)
 */
export function useInitializePayment() {
  return useMutation({
    mutationFn: (payload: InitializePaymentPayload) =>
      paymentsApi.initializePayment(payload),
  });
}

/**
 * Saqlangan karta orqali 1-Click to'lov qilish
 */
export function usePayWithCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayWithCardPayload) => paymentsApi.payWithCard(payload),
    onSuccess: () => {
      // Buyurtmalar va to'lovlar keshlarini yangilash
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

/**
 * Mijozning to'lovlar tarixi
 */
export function useCustomerPayments(params?: { page?: number }) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.getPayments(params),
    staleTime: 30 * 1000,
  });
}

/**
 * To'lov tafsiloti
 */
export function usePaymentDetail(paymentNumber: string, enabled: boolean = true) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentNumber),
    queryFn: () => paymentsApi.getPaymentDetail(paymentNumber),
    enabled: !!paymentNumber && enabled,
    staleTime: 10 * 1000,
  });
}

/**
 * To'lovni bekor qilish
 */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelPaymentPayload) => paymentsApi.cancelPayment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(variables.payment_number),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
