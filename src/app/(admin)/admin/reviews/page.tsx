'use client';

import React, { useState } from 'react';
import {
  useModerationQueue,
  useModerateReview,
} from '@/features/dashboard/hooks/useDashboard';
import {
  ModerateReviewModal,
  ReviewOfficialReplyModal,
} from '@/features/dashboard/components';
import { ReviewItem } from '@/types/reviews';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
  Reply,
  ShieldAlert,
} from 'lucide-react';
import Image from 'next/image';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING');
  const [page, setPage] = useState(1);

  const [selectedReviewForModerate, setSelectedReviewForModerate] = useState<ReviewItem | null>(null);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<ReviewItem | null>(null);

  const moderateMutation = useModerateReview();

  const { data, isLoading, refetch, isRefetching } = useModerationQueue({
    page,
    page_size: 15,
    status: statusFilter || undefined,
  });

  const reviews = data?.results ?? [];

  const handleQuickApprove = (review: ReviewItem) => {
    moderateMutation.mutate({
      id: review.id,
      payload: { status: 'APPROVED', rejection_reason: '' },
    });
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="size-7 text-primary" />
            <span>Sharhlar & Fikrlar Moderatsiyasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Mijozlar tomonidan qoldirilgan baho va fikrlarni tekshirish, tasdiqlash, rad etish va do'kon nomidan javob berish.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </Button>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          variant={statusFilter === 'PENDING' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setStatusFilter('PENDING');
            setPage(1);
          }}
          className="text-xs font-semibold gap-1.5"
        >
          <ShieldAlert className="size-3.5 text-amber-500" />
          <span>Kutayotganlar (PENDING)</span>
          <Badge variant="destructive" className="ml-1 text-[10px] py-0 px-1.5">
            {statusFilter === 'PENDING' ? (data?.count ?? 0) : 'Navbat'}
          </Badge>
        </Button>

        <Button
          variant={statusFilter === 'APPROVED' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setStatusFilter('APPROVED');
            setPage(1);
          }}
          className="text-xs font-semibold gap-1.5"
        >
          <CheckCircle className="size-3.5 text-emerald-500" />
          <span>Tasdiqlanganlar (APPROVED)</span>
        </Button>

        <Button
          variant={statusFilter === 'REJECTED' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setStatusFilter('REJECTED');
            setPage(1);
          }}
          className="text-xs font-semibold gap-1.5"
        >
          <XCircle className="size-3.5 text-rose-500" />
          <span>Rad Etilganlar (REJECTED)</span>
        </Button>

        <Button
          variant={statusFilter === '' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setStatusFilter('');
            setPage(1);
          }}
          className="text-xs font-semibold"
        >
          Barchasi
        </Button>
      </div>

      {/* Sharhlar Ro'yxati */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Tanlangan filtr bo'yicha sharhlar topilmadi
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const authorName = review.user?.display_name || review.user?.first_name || 'Noma\'lum mijoz';

            return (
              <Card key={review.id} className="p-5 hover:shadow-xs transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs">{review.rating} / 5</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="font-semibold text-xs text-foreground">{authorName}</span>
                    <span className="text-muted-foreground text-xs font-mono">• Mahsulot #{review.product}</span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                <div className="py-3 space-y-2">
                  {review.title && (
                    <h4 className="font-bold text-sm text-foreground">{review.title}</h4>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  {/* Rasmlar */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      {review.images.map((img) => (
                        <div key={img.id} className="relative size-14 rounded-md overflow-hidden border">
                          <Image src={img.image} alt="Review" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Do'kon javobi mavjud bo'lsa */}
                  {review.reply && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
                      <p className="font-bold text-primary flex items-center gap-1">
                        <Reply className="size-3" />
                        <span>Do'kon javobi:</span>
                      </p>
                      <p className="text-foreground">{review.reply.comment}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReviewForReply(review)}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <Reply className="size-3.5" />
                    <span>Rasmiy javob yozish</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReviewForModerate(review)}
                    className="h-8 text-xs font-semibold gap-1.5 text-rose-600 hover:text-rose-700"
                  >
                    <XCircle className="size-3.5" />
                    <span>Rad etish</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleQuickApprove(review)}
                    disabled={moderateMutation.isPending}
                    className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>Tasdiqlash</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalCount={data?.count || 0}
        pageSize={15}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
      />

      {/* Moderatsiya Modali */}
      <ModerateReviewModal
        review={selectedReviewForModerate}
        isOpen={Boolean(selectedReviewForModerate)}
        onClose={() => setSelectedReviewForModerate(null)}
      />

      {/* Rasmiy Javob Modali */}
      <ReviewOfficialReplyModal
        review={selectedReviewForReply}
        isOpen={Boolean(selectedReviewForReply)}
        onClose={() => setSelectedReviewForReply(null)}
      />
    </div>
  );
}
