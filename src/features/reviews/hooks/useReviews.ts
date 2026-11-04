import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/features/reviews/api/reviewsApi';
import type {
  ProductRatingSummary,
  PaginatedReviewsResponse,
  ReviewDetail,
  ReviewCreatePayload,
  ReviewUpdatePayload,
  ReviewFilterParams,
  ReviewReplyPayload,
  ReviewVoteType,
} from '@/types/reviews';

export const reviewKeys = {
  all: ['reviews'] as const,
  summary: (productId: number | string) => [...reviewKeys.all, 'summary', String(productId)] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (productId: number | string, params?: ReviewFilterParams) =>
    [...reviewKeys.lists(), String(productId), params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (reviewId: number | string) => [...reviewKeys.details(), String(reviewId)] as const,
};

/**
 * Mahsulot reytingi statistikasi uchun hook
 */
export function useProductRatingSummary(productId: number | string | undefined) {
  return useQuery<ProductRatingSummary>({
    queryKey: reviewKeys.summary(productId || 0),
    queryFn: () => reviewsApi.getProductRatingSummary(productId!),
    enabled: Boolean(productId),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Mahsulot sharhlari ro'yxati va filtrlari uchun hook
 */
export function useProductReviews(
  productId: number | string | undefined,
  params?: ReviewFilterParams
) {
  return useQuery<PaginatedReviewsResponse>({
    queryKey: reviewKeys.list(productId || 0, params),
    queryFn: () => reviewsApi.getProductReviews(productId!, params),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  });
}

/**
 * Bitta sharh tafsilotlari hooki
 */
export function useReviewDetail(reviewId: number | string | undefined) {
  return useQuery<ReviewDetail>({
    queryKey: reviewKeys.detail(reviewId || 0),
    queryFn: () => reviewsApi.getReviewDetail(reviewId!),
    enabled: Boolean(reviewId),
  });
}

/**
 * Yangi sharh qoldirish uchun mutation hook
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number | string;
      data: ReviewCreatePayload;
    }) => {
      return reviewsApi.submitReview(productId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.summary(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
    },
  });
}

/**
 * Sharhni tahrirlash uchun mutation hook
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: number | string;
      productId?: number | string;
      data: ReviewUpdatePayload;
    }) => {
      return reviewsApi.updateReview(reviewId, data);
    },
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.summary(variables.productId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
    },
  });
}

/**
 * Sharhni o'chirish uchun mutation hook
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
    }: {
      reviewId: number | string;
      productId?: number | string;
    }) => {
      return reviewsApi.deleteReview(reviewId);
    },
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.summary(variables.productId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
    },
  });
}

/**
 * Sharhga rasm biriktirish
 */
export function useUploadReviewImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      imageFile,
      caption,
    }: {
      reviewId: number | string;
      productId?: number | string;
      imageFile: File;
      caption?: string;
    }) => {
      return reviewsApi.uploadReviewImage(reviewId, imageFile, caption);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
    },
  });
}

/**
 * Sharhdan rasmni o'chirish
 */
export function useDeleteReviewImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
    }: {
      imageId: number | string;
      reviewId?: number | string;
      productId?: number | string;
    }) => {
      return reviewsApi.deleteReviewImage(imageId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
      if (variables.reviewId) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.detail(variables.reviewId),
        });
      }
    },
  });
}

/**
 * Sharhga foydali/foydasiz deb ovoz berish (Optimistic Updates bilan)
 */
export function useVoteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      voteType,
    }: {
      reviewId: number | string;
      productId: number | string;
      voteType: ReviewVoteType;
    }) => {
      return reviewsApi.voteReview(reviewId, voteType);
    },
    onMutate: async ({ reviewId, productId, voteType }) => {
      // 1. Shu mahsulotga tegishli barcha ro'yxat so'rovlarini bekor qilish
      await queryClient.cancelQueries({
        queryKey: reviewKeys.lists(),
      });

      // 2. Oldingi keshlangan ma'lumotlarni saqlab olish (rollback uchun)
      const previousQueries = queryClient.getQueriesData<PaginatedReviewsResponse>({
        queryKey: [...reviewKeys.lists(), String(productId)],
      });

      // 3. Optimistic update: ro'yxatdagi sharhni yangilash
      queryClient.setQueriesData<PaginatedReviewsResponse>(
        { queryKey: [...reviewKeys.lists(), String(productId)] },
        (old) => {
          if (!old || !old.results) return old;

          const updatedResults = old.results.map((rev) => {
            if (rev.id !== Number(reviewId)) return rev;

            let likesCount = rev.likes_count || 0;
            let dislikesCount = rev.dislikes_count || 0;
            let nextUserVote: ReviewVoteType | null = voteType;

            if (rev.user_vote === voteType) {
              // Qayta bosildi -> Ovoz bekor qilindi
              nextUserVote = null;
              if (voteType === 'HELPFUL') {
                likesCount = Math.max(0, likesCount - 1);
              } else {
                dislikesCount = Math.max(0, dislikesCount - 1);
              }
            } else if (rev.user_vote) {
              // Avval teskari ovoz berilgan edi -> O'zgartirildi
              if (voteType === 'HELPFUL') {
                likesCount += 1;
                dislikesCount = Math.max(0, dislikesCount - 1);
              } else {
                dislikesCount += 1;
                likesCount = Math.max(0, likesCount - 1);
              }
            } else {
              // Yangi ovoz berildi
              if (voteType === 'HELPFUL') {
                likesCount += 1;
              } else {
                dislikesCount += 1;
              }
            }

            return {
              ...rev,
              likes_count: likesCount,
              dislikes_count: dislikesCount,
              user_vote: nextUserVote,
            };
          });

          return {
            ...old,
            results: updatedResults,
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Xatolik yuz berganda oldingi keshni qayta tiklash
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Yakunda serverdagi aniq holat bilan sinxronlashtirish
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
    },
  });
}

/**
 * Sharhga rasmiy do'kon javobi (Reply) qoldirish
 */
export function useReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: number | string;
      productId?: number | string;
      data: ReviewReplyPayload;
    }) => {
      return reviewsApi.replyReview(reviewId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
    },
  });
}
