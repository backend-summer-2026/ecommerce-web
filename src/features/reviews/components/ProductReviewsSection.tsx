'use client';

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingSummaryCard } from './RatingSummaryCard';
import { ReviewFilters } from './ReviewFilters';
import { ReviewCard } from './ReviewCard';
import { ReviewFormModal } from './ReviewFormModal';
import { DeleteReviewModal } from './DeleteReviewModal';
import { OfficialReplyModal } from './OfficialReplyModal';
import { ReviewImageLightbox } from './ReviewImageLightbox';
import {
  useProductRatingSummary,
  useProductReviews,
} from '@/features/reviews/hooks/useReviews';
import type {
  ReviewItem,
  ReviewImage,
  ReviewFilterParams,
} from '@/types/reviews';

interface ProductReviewsSectionProps {
  productId: number;
  productName?: string;
  className?: string;
}

const PAGE_SIZE = 10;

export function ProductReviewsSection({
  productId,
  productName,
  className = '',
}: ProductReviewsSectionProps) {
  // Filtrlash va sahifalash holati
  const [filters, setFilters] = useState<ReviewFilterParams>({
    page: 1,
    page_size: PAGE_SIZE,
    ordering: '-created_at',
  });

  // Modallar holati
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);

  const [lightboxImages, setLightboxImages] = useState<ReviewImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Ma'lumotlarni so'rash
  const { data: summary, isLoading: isSummaryLoading } =
    useProductRatingSummary(productId);

  const { data: reviewsData, isLoading: isReviewsLoading } =
    useProductReviews(productId, filters);

  const reviews = reviewsData?.results || [];
  const totalCount = reviewsData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = filters.page || 1;

  // Harakatlar
  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (reviewId: number) => {
    setDeletingReviewId(reviewId);
    setDeleteModalOpen(true);
  };

  const handleOpenReplyModal = (review: ReviewItem) => {
    setReplyingReview(review);
    setReplyModalOpen(true);
  };

  const handleOpenLightbox = (images: ReviewImage[], initialIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(initialIndex);
    setLightboxOpen(true);
  };

  return (
    <section id="reviews" className={`space-y-8 scroll-mt-20 ${className}`}>
      {/* Sarlavha */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Mijozlar fikri va sharhlari
            </h2>
            {summary && summary.total_reviews > 0 && (
              <span className="rounded-full bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5">
                {summary.total_reviews}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Mahsulot haqidagi barcha haqqoniy baholar va sharhlar
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 font-bold shadow-sm cursor-pointer"
        >
          <MessageSquarePlus className="size-4" />
          <span>Fikr bildirish</span>
        </Button>
      </div>

      {/* Reyting Statistikasi Kartochkasi */}
      <RatingSummaryCard
        summary={summary}
        isLoading={isSummaryLoading}
        onOpenReviewModal={handleOpenCreateModal}
        selectedRatingFilter={filters.rating}
        onSelectRatingFilter={(rating) =>
          setFilters((prev) => ({ ...prev, rating, page: 1 }))
        }
      />

      {/* Filtrlar va Saralash */}
      <ReviewFilters
        filters={filters}
        onChange={setFilters}
        totalCount={totalCount}
      />

      {/* Sharhlar Ro'yxati */}
      <div className="space-y-4">
        {isReviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-6 space-y-4 bg-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 sm:p-14 text-center space-y-4 bg-muted/20">
            <PackageOpen className="size-14 mx-auto text-muted-foreground/60" />
            <div className="max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Hozircha sharhlar topilmadi
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {filters.rating || filters.verified_only
                  ? 'Tanlangan filtrlar bo‘yicha sharhlar mavjud emas. Filtrlarni o‘zgartirib ko‘ring.'
                  : 'Ushbu mahsulot haqida birinchi bo‘lib o‘z fikringizni bildiring!'}
              </p>
            </div>

            <div className="pt-2">
              {filters.rating || filters.verified_only ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ page: 1, page_size: PAGE_SIZE, ordering: '-created_at' })
                  }
                  className="cursor-pointer text-xs"
                >
                  Filtrlarni tozalash
                </Button>
              ) : (
                <Button
                  onClick={handleOpenCreateModal}
                  className="gap-2 cursor-pointer font-bold"
                >
                  <MessageSquarePlus className="size-4" />
                  <span>Birinchi bo‘lib sharh qoldiring</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                productId={productId}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onReply={handleOpenReplyModal}
                onOpenLightbox={handleOpenLightbox}
              />
            ))}
          </div>
        )}

        {/* Sahifalash (Pagination) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t text-xs">
            <span className="text-muted-foreground">
              Jami {totalCount} ta sharhdan {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, totalCount)} ko‘rsatilmoqda
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: Math.max(1, currentPage - 1) }))
                }
                disabled={currentPage <= 1 || isReviewsLoading}
                className="gap-1 cursor-pointer h-8 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Oldingi</span>
              </Button>

              <span className="px-3 font-semibold text-foreground">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, currentPage + 1),
                  }))
                }
                disabled={currentPage >= totalPages || isReviewsLoading}
                className="gap-1 cursor-pointer h-8 text-xs"
              >
                <span>Keyingi</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sharh yaratish / tahrirlash modali */}
      <ReviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productId={productId}
        productName={productName}
        initialReview={editingReview}
      />

      {/* Sharhni o'chirish tasdiqlash modali */}
      <DeleteReviewModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        reviewId={deletingReviewId}
        productId={productId}
      />

      {/* Rasmiy javob qaytarish modali */}
      <OfficialReplyModal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        reviewId={replyingReview?.id || null}
        productId={productId}
        initialComment={replyingReview?.reply?.comment || ''}
        reviewerName={
          replyingReview?.user?.display_name || replyingReview?.user?.first_name
        }
      />

      {/* Rasmlar Lightbox / Galereyasi */}
      <ReviewImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </section>
  );
}
