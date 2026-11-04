import type { PaginatedResponse } from './index';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReviewVoteType = 'HELPFUL' | 'UNHELPFUL';

export interface ReviewUserPublic {
  id: number;
  first_name?: string;
  display_name: string;
}

export interface ReviewImage {
  id: number;
  review: number;
  image: string;
  caption?: string;
  created_at: string;
}

export interface ReviewReply {
  id: number;
  review: number;
  user: number;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewItem {
  id: number;
  product: number;
  user: ReviewUserPublic;
  rating: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  is_verified_purchase?: boolean;
  likes_count?: number;
  dislikes_count?: number;
  images: ReviewImage[];
  reply?: ReviewReply | null;
  user_vote?: ReviewVoteType | string | null;
  created_at: string;
}

export interface ReviewDetail extends ReviewItem {
  status?: ReviewStatus;
  rejection_reason?: string;
  order_item?: number | null;
  updated_at?: string;
}

export interface ProductRatingSummary {
  product: number;
  average_rating: string | number;
  total_reviews: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  updated_at: string;
}

export interface ReviewCreatePayload {
  rating: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
}

export interface ReviewUpdatePayload {
  rating?: number;
  title?: string;
  comment?: string;
  pros?: string;
  cons?: string;
}

export interface ReviewVotePayload {
  vote_type: ReviewVoteType;
}

export interface ReviewReplyPayload {
  comment: string;
}

export interface ReviewFilterParams {
  rating?: number;
  verified_only?: boolean;
  ordering?: '-created_at' | 'created_at' | '-likes_count' | '-rating' | 'rating' | string;
  page?: number;
  page_size?: number;
}

export type PaginatedReviewsResponse = PaginatedResponse<ReviewItem>;
