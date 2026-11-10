'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  LogIn,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RatingStars } from './RatingStars';
import {
  useSubmitReview,
  useUpdateReview,
  useUploadReviewImage,
  useDeleteReviewImage,
} from '@/features/reviews/hooks/useReviews';
import { parseReviewError } from '@/features/reviews/api/reviewsApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ReviewItem, ReviewImage } from '@/types/reviews';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName?: string;
  initialReview?: ReviewItem | null;
}

interface ImageUploadItem {
  file: File;
  previewUrl: string;
  caption: string;
}

interface InnerReviewFormProps {
  onClose: () => void;
  productId: number;
  productName?: string;
  initialReview?: ReviewItem | null;
}

function InnerReviewForm({
  onClose,
  productId,
  productName,
  initialReview,
}: InnerReviewFormProps) {
  const { isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [title, setTitle] = useState(initialReview?.title || '');
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [pros, setPros] = useState(initialReview?.pros || '');
  const [cons, setCons] = useState(initialReview?.cons || '');

  // Yangi biriktiriladigan fayllar ro'yxati
  const [pendingImages, setPendingImages] = useState<ImageUploadItem[]>([]);
  // Tahrirlashda mavjud bo'lgan serverdagi rasmlar
  const [existingImages, setExistingImages] = useState<ReviewImage[]>(
    initialReview?.images || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  const submitMutation = useSubmitReview();
  const updateMutation = useUpdateReview();
  const uploadImageMutation = useUploadReviewImage();
  const deleteImageMutation = useDeleteReviewImage();

  const isEditing = Boolean(initialReview);

  // Fayllarni tanlash
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageUploadItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" rasm fayli emas!`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" hajmi 5MB dan oshmasligi kerak`);
        continue;
      }

      newItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: '',
      });
    }

    setPendingImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  const updatePendingCaption = (index: number, caption: string) => {
    setPendingImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], caption };
      return next;
    });
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    try {
      await deleteImageMutation.mutateAsync({
        imageId,
        reviewId: initialReview?.id,
        productId,
      });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Rasm o‘chirildi');
    } catch (err) {
      toast.error(parseReviewError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || rating < 1) {
      toast.error('Iltimos, yulduzcha tanlab baholang');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('Sharh matni kamida 10 ta belgidan iborat bo‘lishi lozim');
      return;
    }

    setIsSubmitting(true);
    setUploadProgressText('Sharh saqlanmoqda...');

    try {
      let savedReviewId: number;

      if (isEditing && initialReview) {
        const updated = await updateMutation.mutateAsync({
          reviewId: initialReview.id,
          productId,
          data: {
            rating,
            title: title.trim() || undefined,
            comment: comment.trim(),
            pros: pros.trim() || undefined,
            cons: cons.trim() || undefined,
          },
        });
        savedReviewId = updated.id;
      } else {
        const created = await submitMutation.mutateAsync({
          productId,
          data: {
            rating,
            title: title.trim() || undefined,
            comment: comment.trim(),
            pros: pros.trim() || undefined,
            cons: cons.trim() || undefined,
          },
        });
        savedReviewId = created.id;
      }

      // Agar biriktirilgan rasmlar bo'lsa, ularni ketma-ket yuklash
      if (pendingImages.length > 0) {
        for (let i = 0; i < pendingImages.length; i++) {
          const item = pendingImages[i];
          setUploadProgressText(
            `Rasmlar yuklanmoqda (${i + 1}/${pendingImages.length})...`
          );
          await uploadImageMutation.mutateAsync({
            reviewId: savedReviewId,
            productId,
            imageFile: item.file,
            caption: item.caption.trim() || undefined,
          });
        }
      }

      toast.success(
        isEditing
          ? 'Sharhingiz muvaffaqiyatli yangilandi!'
          : 'Sharhingiz uchun rahmat! Muvaffaqiyatli qabul qilindi.'
      );
      onClose();
    } catch (err) {
      toast.error(parseReviewError(err));
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  return (
    <div
      className="w-full max-w-2xl rounded-2xl bg-card border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Sarlavhasi */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {isEditing ? 'Sharhni tahrirlash' : 'Mahsulotga sharh qoldirish'}
          </h2>
          {productName && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {productName}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Agar foydalanuvchi tizimga kirmagan bo'lsa */}
      {!isAuthenticated ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-6 text-center space-y-4">
          <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
            <LogIn className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Tizimga kirish talab qilinadi
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              Sharh qoldirish va baholash uchun hisobingizga kiring yoki ro‘yxatdan o‘ting.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Yopish
            </Button>
            <Link href={`/login?redirect=/products/${productId}`}>
              <Button className="gap-2 cursor-pointer font-bold">
                <LogIn className="size-4" />
                <span>Kirish</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Baholash yulduzlari */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>Mahsulotni baholang:</span>
              <span className="text-destructive">*</span>
            </label>
            <div className="p-4 rounded-xl bg-muted/40 border flex flex-col sm:flex-row items-center justify-between gap-4">
              <RatingStars
                rating={rating}
                size="xl"
                interactive
                onRatingChange={(newRating) => setRating(newRating)}
              />
              <span className="text-xs text-muted-foreground">
                (Yulduz ustiga bosing)
              </span>
            </div>
          </div>

          {/* 2. Sarlavha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Sharh sarlavhasi (qisqacha):
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Dasturlash uchun ajoyib tanlov!"
              maxLength={120}
              className="h-11 rounded-xl"
            />
          </div>

          {/* 3. Afzalliklari va Kamchiliklari */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="size-3.5" />
                <span>Afzalliklari (Pros):</span>
              </label>
              <Input
                type="text"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Kamerasi, batareya quvvati..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <ThumbsDown className="size-3.5" />
                <span>Kamchiliklari (Cons):</span>
              </label>
              <Input
                type="text"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Narxi biroz baland..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* 4. Batafsil Sharh Matni */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                <span>Batafsil sharhingiz:</span>
                <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                {comment.length} / 1000 ta belgi
              </span>
            </div>
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Mahsulotning sifati, ishlashi va o‘z taassurotlaringiz haqida yozing (kamida 10 ta belgi)..."
              maxLength={1000}
              required
              className="w-full rounded-xl border bg-background p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* 5. Rasmlar yuklash bo'limi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <UploadCloud className="size-4 text-primary" />
                <span>Mahsulot fotosuratlari (ixtiyoriy):</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Har biri maks. 5MB
              </span>
            </div>

            {/* Serverdagi mavjud rasmlar (agar tahrirlash bo'lsa) */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Saqlangan rasmlar:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
                    >
                      <Image
                        src={img.image}
                        alt={img.caption || 'Sharh rasmi'}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-destructive text-destructive-foreground opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow"
                        title="Rasmni o‘chirish"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yangi tanlangan rasmlar prevyusi */}
            {pendingImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingImages.map((img, idx) => (
                  <div
                    key={img.previewUrl}
                    className="flex items-center gap-3 p-2.5 rounded-xl border bg-muted/30"
                  >
                    <div className="relative size-16 shrink-0 rounded-lg overflow-hidden border">
                      <Image
                        src={img.previewUrl}
                        alt="Prevyu"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        type="text"
                        value={img.caption}
                        onChange={(e) => updatePendingCaption(idx, e.target.value)}
                        placeholder="Rasm izohi (masalan, quti)..."
                        className="h-8 text-xs rounded-lg"
                      />
                      <span className="text-[11px] text-muted-foreground truncate block">
                        {img.file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePendingImage(idx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="O‘chirish"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yuklash maydoni */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-4 sm:p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer border-muted-foreground/25"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFilesSelected}
                className="hidden"
              />
              <UploadCloud className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Rasmlarni tanlash uchun bosing
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PNG, JPG yoki WEBP formatlarida
              </p>
            </div>
          </div>

          {/* Xabardorlik */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <span>
              Sharhingiz boshqa xaridorlarga to‘g‘ri qaror qabul qilishda yordam beradi.
              Iltimos, haqqoniy va odob doirasidagi fikrlarni bayon eting.
            </span>
          </div>

          {/* Pastki tugmalar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Bekor qilish
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || comment.trim().length < 10}
              className="gap-2 cursor-pointer font-bold min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{uploadProgressText || 'Saqlanmoqda...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>{isEditing ? 'O‘zgarishlarni saqlash' : 'Chop etish'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ReviewFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  initialReview,
}: ReviewFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <InnerReviewForm
        key={initialReview ? `edit-${initialReview.id}` : `new-${productId}`}
        onClose={onClose}
        productId={productId}
        productName={productName}
        initialReview={initialReview}
      />
    </div>
  );
}
