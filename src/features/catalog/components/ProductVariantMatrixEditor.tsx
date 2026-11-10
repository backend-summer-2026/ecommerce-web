'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface GeneratedVariant {
  id: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: string;
  discountPrice: string;
  stock: number;
  isDefault: boolean;
}

interface AttributeDef {
  id: string;
  name: string;
  valuesInput: string;
}

interface ProductVariantMatrixEditorProps {
  basePrice?: string;
  baseSkuPrefix?: string;
  onVariantsGenerated?: (variants: GeneratedVariant[]) => void;
}

export function ProductVariantMatrixEditor({
  basePrice = '100',
  baseSkuPrefix = 'PROD',
  onVariantsGenerated,
}: ProductVariantMatrixEditorProps) {
  const [attributes, setAttributes] = useState<AttributeDef[]>([
    { id: '1', name: 'Rang', valuesInput: 'Qora, Kumush, Oltin' },
    { id: '2', name: 'Xotira / O\'lcham', valuesInput: '128GB, 256GB' },
  ]);

  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { id: `${Date.now()}`, name: '', valuesInput: '' },
    ]);
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const generateMatrix = () => {
    const validAttrs = attributes
      .filter((a) => a.name.trim() && a.valuesInput.trim())
      .map((a) => ({
        name: a.name.trim(),
        values: a.valuesInput.split(',').map((v) => v.trim()).filter(Boolean),
      }))
      .filter((a) => a.values.length > 0);

    if (validAttrs.length === 0) {
      toast.error('Kamida 1 ta atribut va uning qiymatlarini kiriting');
      return;
    }

    // Cartesian product
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]]
      );
    };

    const valueArrays = validAttrs.map((a) => a.values);
    const combinations = cartesian(valueArrays);

    const variants: GeneratedVariant[] = combinations.map((comb, index) => {
      const attrMap: Record<string, string> = {};
      validAttrs.forEach((attr, idx) => {
        attrMap[attr.name] = comb[idx];
      });

      const title = comb.join(' / ');
      const skuSuffix = comb
        .join('-')
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');

      return {
        id: `var-${Date.now()}-${index}`,
        sku: `${baseSkuPrefix.toUpperCase()}-${skuSuffix}`,
        title,
        attributes: attrMap,
        price: basePrice,
        discountPrice: '',
        stock: 10,
        isDefault: index === 0,
      };
    });

    setGeneratedVariants(variants);
    onVariantsGenerated?.(variants);
    toast.success(`${variants.length} ta variant matritsasi generatsiya qilindi!`);
  };

  const updateVariant = (id: string, field: keyof GeneratedVariant, val: any) => {
    setGeneratedVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: val };
        }
        if (field === 'isDefault' && val === true) {
          return { ...v, isDefault: false };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-4 rounded-xl border p-4 bg-muted/10">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Variantlar Matritsasi Konstruktori</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atributlarni kiriting (vergul bilan ajrating) va avtomatik kombinatsiyalar matritsasini hosil qiling.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={generateMatrix}
          className="gap-1.5 text-xs font-bold"
        >
          <Sparkles className="size-3.5" />
          <span>Matritsani Generatsiya Qilish</span>
        </Button>
      </div>

      {/* Atributlar ro'yxati */}
      <div className="space-y-2">
        {attributes.map((attr, index) => (
          <div key={attr.id} className="flex items-center gap-2">
            <Input
              placeholder={`Atribut nomi (masalan: Rang)`}
              value={attr.name}
              onChange={(e) => {
                const val = e.target.value;
                setAttributes((prev) =>
                  prev.map((a) => (a.id === attr.id ? { ...a, name: val } : a))
                );
              }}
              className="w-1/3 text-xs h-9 bg-background"
            />
            <Input
              placeholder="Qiymatlar (vergul bilan: Qora, Oq, Kumush)"
              value={attr.valuesInput}
              onChange={(e) => {
                const val = e.target.value;
                setAttributes((prev) =>
                  prev.map((a) => (a.id === attr.id ? { ...a, valuesInput: val } : a))
                );
              }}
              className="flex-1 text-xs h-9 bg-background"
            />
            {attributes.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAttribute(attr.id)}
                className="size-9 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAttribute}
          className="gap-1.5 text-xs h-8"
        >
          <Plus className="size-3.5" />
          <span>Yana atribut qo'shish</span>
        </Button>
      </div>

      {/* Hosil bo'lgan Matritsa Jadvali */}
      {generatedVariants.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              Hosil bo'lgan SKU kombinatsiyalari ({generatedVariants.length} ta)
            </span>
            <Badge variant="outline" className="text-[11px]">
              Standart narx: ${basePrice}
            </Badge>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 font-semibold text-muted-foreground border-b">
                <tr>
                  <th className="py-2.5 px-3">Variant Nomi</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 w-28">Narxi ($)</th>
                  <th className="py-2.5 px-3 w-28">Chegirma ($)</th>
                  <th className="py-2.5 px-3 w-24">Zaxira</th>
                  <th className="py-2.5 px-3 text-center w-20">Asosiy</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {generatedVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-semibold text-foreground">{v.title}</td>
                    <td className="py-2 px-3">
                      <Input
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                        className="h-7 text-xs font-mono bg-background"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                        className="h-7 text-xs bg-background"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        placeholder="ixtiyoriy"
                        value={v.discountPrice}
                        onChange={(e) => updateVariant(v.id, 'discountPrice', e.target.value)}
                        className="h-7 text-xs bg-background"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(v.id, 'stock', Number(e.target.value))}
                        className="h-7 text-xs bg-background"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="radio"
                        name="default_variant"
                        checked={v.isDefault}
                        onChange={() => updateVariant(v.id, 'isDefault', true)}
                        className="accent-primary size-4 cursor-pointer"
                        title="Asosiy standart variant sifatida belgilash"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
