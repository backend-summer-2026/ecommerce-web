import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Elektron pochta manzili kiritilishi shart')
    .email('To\'g\'ri elektron pochta manzilini kiriting'),
  password: z
    .string()
    .min(1, 'Parol kiritilishi shart'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
    last_name: z
      .string()
      .trim()
      .min(2, 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak'),
    email: z
      .string()
      .trim()
      .min(1, 'Elektron pochta manzili kiritilishi shart')
      .email('To\'g\'ri elektron pochta manzilini kiriting'),
    phone_number: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'),
    password_confirm: z
      .string()
      .min(1, 'Parolni tasdiqlash shart'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Parollar bir-biriga mos kelmadi',
    path: ['password_confirm'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const sendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Elektron pochta manzili kiritilishi shart')
    .email('To\'g\'ri elektron pochta manzilini kiriting'),
});

export type SendOtpFormData = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Elektron pochta manzili kiritilishi shart')
    .email('To\'g\'ri elektron pochta manzilini kiriting'),
  code: z
    .string()
    .trim()
    .length(6, 'Tasdiqlash kodi 6 xonali raqam bo\'lishi kerak')
    .regex(/^\d+$/, 'Tasdiqlash kodi faqat raqamlardan iborat bo\'lishi kerak'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  last_name: z
    .string()
    .trim()
    .min(2, 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak'),
  phone_number: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
