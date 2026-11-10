import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  ProductRatingSummary,
  PaginatedReviewsResponse,
  ReviewDetail,
  ReviewCreatePayload,
  ReviewUpdatePayload,
  ReviewVotePayload,
  ReviewReplyPayload,
  ReviewImage,
  ReviewFilterParams,
} from '@/types/reviews';
import axios from 'axios';

export function parseReviewError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }

    const fieldErrors: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        fieldErrors.push(`${key}: ${value[0]}`);
      } else if (typeof value === 'string') {
        fieldErrors.push(`${key}: ${value}`);
      }
    }
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Sharh bilan bog‘liq amalda kutilmagan xatolik yuz berdi.';
}

export const reviewsApi = {
  /**
   * Mahsulot reytingi statistikasi (o'rtacha baho, 1-5 yulduzlar taqsimoti, jami sharhlar soni)
   */
  async getProductRatingSummary(productId: number | string): Promise<ProductRatingSummary> {
    const res = await apiClient.get<ProductRatingSummary>(
      API_ENDPOINTS.REVIEWS.SUMMARY(productId)
    );
    return res.data;
  },

  /**
   * Mahsulotga yozilgan barcha tasdiqlangan sharhlar ro'yxati (filtrlash va sahifalash bilan)
   */
  async getProductReviews(
    productId: number | string,
    params?: ReviewFilterParams
  ): Promise<PaginatedReviewsResponse> {
    const cleanParams: Record<string, unknown> = {};

    if (params?.rating) {
      cleanParams.rating = params.rating;
    }
    if (params?.verified_only !== undefined) {
      cleanParams.verified_only = params.verified_only;
    }
    if (params?.ordering) {
      cleanParams.ordering = params.ordering;
    }
    if (params?.page) {
      cleanParams.page = params.page;
    }
    if (params?.page_size) {
      cleanParams.page_size = params.page_size;
    }

    const res = await apiClient.get<PaginatedReviewsResponse>(
      API_ENDPOINTS.REVIEWS.LIST(productId),
      { params: cleanParams }
    );
    return res.data;
  },

  /**
   * Bitta sharhning batafsil ma'lumotlari
   */
  async getReviewDetail(reviewId: number | string): Promise<ReviewDetail> {
    const res = await apiClient.get<ReviewDetail>(
      API_ENDPOINTS.REVIEWS.DETAIL(reviewId)
    );
    return res.data;
  },

  /**
   * Yangi sharh qoldirish
   */
  async submitReview(
    productId: number | string,
    payload: ReviewCreatePayload
  ): Promise<ReviewDetail> {
    const res = await apiClient.post<ReviewDetail>(
      API_ENDPOINTS.REVIEWS.SUBMIT(productId),
      payload
    );
    return res.data;
  },

  /**
   * O'z sharhini tahrirlash
   */
  async updateReview(
    reviewId: number | string,
    payload: ReviewUpdatePayload
  ): Promise<ReviewDetail> {
    const res = await apiClient.patch<ReviewDetail>(
      API_ENDPOINTS.REVIEWS.UPDATE(reviewId),
      payload
    );
    return res.data;
  },

  /**
   * Sharhni o'chirish
   */
  async deleteReview(reviewId: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
  },

  /**
   * Sharhga rasm biriktirish
   */
  async uploadReviewImage(
    reviewId: number | string,
    imageFile: File,
    caption?: string
  ): Promise<ReviewImage> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (caption) {
      formData.append('caption', caption);
    }

    const res = await apiClient.post<ReviewImage>(
      API_ENDPOINTS.REVIEWS.UPLOAD_IMAGE(reviewId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  /**
   * Sharhdagi rasmni o'chirish
   */
  async deleteReviewImage(imageId: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE_IMAGE(imageId));
  },

  /**
   * Sharhga foydali (HELPFUL) yoki foydasiz (UNHELPFUL) deb ovoz berish
   * (Bir xil turdagi ovozni qayta bosish uni bekor qiladi / toggle)
   */
  async voteReview(
    reviewId: number | string,
    voteType: 'HELPFUL' | 'UNHELPFUL'
  ): Promise<void> {
    const payload: ReviewVotePayload = { vote_type: voteType };
    await apiClient.post(API_ENDPOINTS.REVIEWS.VOTE(reviewId), payload);
  },

  /**
   * Do'kon ma'muriyati nomidan sharhga rasmiy javob qaytarish
   */
  async replyReview(
    reviewId: number | string,
    payload: ReviewReplyPayload
  ): Promise<ReviewDetail['reply']> {
    const res = await apiClient.post<ReviewDetail['reply']>(
      API_ENDPOINTS.REVIEWS.REPLY(reviewId),
      payload
    );
    return res.data;
  },
};
