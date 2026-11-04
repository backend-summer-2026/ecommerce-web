'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Package,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { ProductGallery } from '@/features/catalog/components/ProductGallery';
import { VariantSelector } from '@/features/catalog/components/VariantSelector';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useProductDetail, useFeaturedProducts } from '@/features/catalog/hooks/useCatalog';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { ProductVariant } from '@/types/catalog';

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const { data: product, isLoading, error } = useProductDetail(slug);
  const { data: featuredData } = useFeaturedProducts();
  const { addItem, isLoading: isCartAdding } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Skeleton className="h-6 w-1/3 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-1/2 rounded-md" />
            <Skeleton className="h-28 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <Package className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-bold">Mahsulot topilmadi</h2>
        <p className="text-muted-foreground mt-2">
          Ushbu mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin.
        </p>
        <Link href="/catalog" className="inline-block mt-6">
          <Button variant="default">
            <ArrowLeft className="size-4 mr-2" />
            Katalogga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  const currentVariant = selectedVariant || product.default_variant || product.variants[0];
  const isAvailable = currentVariant ? currentVariant.is_in_stock && currentVariant.available_quantity > 0 : product.is_in_stock;

  const priceToDisplay = currentVariant?.final_price || currentVariant?.price;
  const originalPrice = currentVariant?.is_on_sale && currentVariant?.price ? currentVariant.price : null;

  const handleAddToCart = async () => {
    if (!isAvailable || !currentVariant) {
      toast.error('Ushbu mahsulot omborda mavjud emas');
      return;
    }

    const success = await addItem(currentVariant.id, quantity, true);
    if (success) {
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    if (!isAvailable || !currentVariant) {
      toast.error('Ushbu mahsulot omborda mavjud emas');
      return;
    }
    const success = await addItem(currentVariant.id, quantity, false);
    if (success) {
      router.push('/checkout');
    }
  };

  // O'xshash / tavsiya etilgan mahsulotlar (featured dan)
  const relatedProducts = (featuredData?.new_arrivals || featuredData?.on_sale || [])
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumbs Navigatsiya */}
      <nav className="flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/catalog" className="hover:text-foreground transition-colors">
          Katalog
        </Link>
        {product.breadcrumbs &&
          product.breadcrumbs.map((bc) => (
            <React.Fragment key={bc.id}>
              <ChevronRight className="size-3.5" />
              <Link
                href={`/catalog?category=${bc.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {bc.name}
              </Link>
            </React.Fragment>
          ))}
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Asosiy 2 ustunli mahsulot bloki */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Chap ustun: Galereya */}
        <div className="lg:col-span-7 sticky top-24">
          <ProductGallery
            media={product.media}
            productName={product.name}
            selectedVariantId={currentVariant?.id}
          />
        </div>

        {/* O'ng ustun: Mahsulot tafsilotlari, variantlar va harakatlar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brend va Status */}
          <div className="flex items-center justify-between gap-3">
            {product.brand ? (
              <Link
                href={`/catalog?brand=${product.brand.slug}`}
                className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline"
              >
                {product.brand.name}
              </Link>
            ) : <span />}

            <Badge
              variant={isAvailable ? 'default' : 'secondary'}
              className={isAvailable ? 'bg-emerald-600' : 'text-destructive'}
            >
              {isAvailable ? 'Omborda mavjud' : 'Sotuvda yo‘q'}
            </Badge>
          </div>

          {/* Sarlavha */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Narx Bloki */}
          <div className="rounded-xl bg-muted/40 p-4 border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Narxi:</span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {formatPrice(priceToDisplay)}
                </span>
                {originalPrice && (
                  <span className="text-sm sm:text-base text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {currentVariant?.is_on_sale && originalPrice && (
              <Badge variant="destructive" className="font-bold text-xs">
                Chegirma
              </Badge>
            )}
          </div>

          {/* Variant tanlagich */}
          {product.variants && product.variants.length > 1 && currentVariant && (
            <VariantSelector
              variants={product.variants}
              dynamicAttributes={product.dynamic_attributes}
              selectedVariant={currentVariant}
              onVariantSelect={(v) => setSelectedVariant(v)}
            />
          )}

          {/* Soni (Quantity) va Sotib olish tugmalari */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Miqdor:</span>
              <div className="flex items-center border rounded-lg bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !isAvailable}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Kamaytirish"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentVariant?.available_quantity || 10, q + 1))}
                  disabled={!isAvailable || quantity >= (currentVariant?.available_quantity || 10)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Ko'paytirish"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {currentVariant?.available_quantity && isAvailable && (
                <span className="text-xs text-muted-foreground">
                  (Mavjud: {currentVariant.available_quantity} dona)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                size="lg"
                variant={isAddedToCart ? 'secondary' : 'default'}
                className="w-full gap-2 font-bold text-sm h-12 shadow-md cursor-pointer"
                onClick={handleAddToCart}
                disabled={!isAvailable || isCartAdding}
              >
                {isCartAdding ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Qo'shilmoqda...</span>
                  </>
                ) : isAddedToCart ? (
                  <>
                    <Check className="size-5 text-emerald-600" />
                    <span>Qo'shildi!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-5" />
                    <span>Savatchaga qo'shish</span>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 font-bold text-sm h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer"
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
                <Zap className="size-5 fill-current" />
                <span>Bir bosishda xarid</span>
              </Button>
            </div>
          </div>

          {/* Kafolat va Afzalliklar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-primary shrink-0" />
              <span>Tezkor yetkazib berish</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>100% asl mahsulot</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-primary shrink-0" />
              <span>14 kun ichida qaytarish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tafsilotlar Tablari: Tavsif, Xususiyatlar, Yetkazib berish */}
      <div className="pt-8 border-t space-y-6">
        <div className="flex items-center gap-4 border-b">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'desc'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Batafsil Tavsif
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Xususiyatlar va Parametrlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Yetkazib berish va Kafolat
          </button>
        </div>

        {/* Tab Kontentlari */}
        <div className="py-2">
          {activeTab === 'desc' && (
            <div className="prose max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p className="text-base text-foreground font-medium">
                {product.short_description}
              </p>
              <div className="whitespace-pre-line text-sm">
                {product.description || "Ushbu mahsulot uchun batafsil matn kiritilmagan."}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4 max-w-2xl">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2.5 font-medium text-muted-foreground w-1/3">Brend</td>
                    <td className="py-2.5 font-semibold text-foreground">{product.brand?.name || '—'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 font-medium text-muted-foreground">Kategoriyalar</td>
                    <td className="py-2.5 font-semibold text-foreground">
                      {product.categories.map((c) => c.name).join(', ')}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 font-medium text-muted-foreground">Faol SKU</td>
                    <td className="py-2.5 font-mono text-xs">{currentVariant?.sku || '—'}</td>
                  </tr>
                  {/* Dinamik atributlar jadvali */}
                  {product.dynamic_attributes?.map((attr) => (
                    <tr key={attr.slug} className="border-b">
                      <td className="py-2.5 font-medium text-muted-foreground">{attr.name}</td>
                      <td className="py-2.5 font-semibold text-foreground">
                        {attr.values.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              <h4 className="font-bold text-foreground">Yetkazib berish shartlari:</h4>
              <p>
                Toshkent shahri bo'ylab buyurtma qilingan kunning o'zida yoki 24 soat ichida eshikkacha bepul yetkazib beriladi.
                O'zbekistonning boshqa viloyatlariga esa 2-3 ish kuni ichida kuryerlik xizmatlari orqali yetkaziladi.
              </p>
              <h4 className="font-bold text-foreground pt-2">Kafolat va qaytarish:</h4>
              <p>
                Barcha mahsulotlar ishlab chiqaruvchining rasmiy kafolatiga ega. Mahsulotda nuqson aniqlansa yoki kutganingizdek chiqmasa, 14 kun ichida to'liq pulni qaytarib olishingiz yoki boshqasiga almashtirishingiz mumkin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* O'xshash Mahsulotlar Bloki */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sizga yoqishi mumkin
            </h2>
            <Link
              href="/catalog"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              Katalogni ko'rish &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
