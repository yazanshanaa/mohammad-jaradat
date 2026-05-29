import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً').max(100),
  phone: z.string().min(9, 'رقم هاتف غير صحيح').max(15),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  message: z.string().min(10, 'الرسالة قصيرة جداً').max(2000),
});

export const leadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(9).max(15),
  email: z.string().email().optional().or(z.literal('')),
  location: z.string().min(1),
  usageType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']),
  monthlyBillIls: z.coerce.number().min(0).max(100000),
  monthlyKwh: z.coerce.number().optional(),
  notes: z.string().max(1000).optional(),
  calculatorResult: z.any().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const blogPostSchema = z.object({
  slug: z.string().min(3),
  titleAr: z.string().min(5),
  titleEn: z.string(),
  contentAr: z.string().min(10),
  contentEn: z.string(),
  excerptAr: z.string().max(300),
  excerptEn: z.string().max(300),
  coverImage: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  readingTime: z.coerce.number().int().min(1).default(5),
  isPublished: z.boolean().default(false),
  metaTitleAr: z.string().optional().nullable(),
  metaTitleEn: z.string().optional().nullable(),
  metaDescAr: z.string().optional().nullable(),
  metaDescEn: z.string().optional().nullable(),
});

export const solarSystemSchema = z.object({
  slug: z.string().min(3),
  titleAr: z.string().min(5),
  titleEn: z.string(),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string(),
  type: z.enum(['ON_GRID', 'OFF_GRID', 'HYBRID', 'AGRICULTURAL', 'COMMERCIAL']),
  features: z.any().default([]), // Using any for Json fields to avoid strict type issues with prisma
  specs: z.any().default({}),
  minPower: z.coerce.number().int().min(0),
  maxPower: z.coerce.number().int().min(0),
  pricePerWatt: z.coerce.number().min(0),
  coverImage: z.string(),
  gallery: z.any().default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const serviceSchema = z.object({
  slug: z.string().min(3),
  titleAr: z.string().min(5),
  titleEn: z.string(),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string(),
  shortDescAr: z.string().min(5),
  shortDescEn: z.string(),
  icon: z.string(),
  coverImage: z.string().optional().nullable(),
  features: z.any().default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const projectSchema = z.object({
  slug: z.string().min(3),
  titleAr: z.string().min(5),
  titleEn: z.string(),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string(),
  category: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']),
  location: z.string(),
  powerKw: z.coerce.number().min(0),
  panelsCount: z.coerce.number().int().min(0),
  completionDate: z.coerce.date(),
  clientName: z.string().optional().nullable(),
  annualSavingIls: z.coerce.number().min(0),
  coverImage: z.string(),
  beforeImage: z.string().optional().nullable(),
  afterImage: z.string().optional().nullable(),
  gallery: z.any().default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  systemId: z.string().optional().nullable(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type SolarSystemInput = z.infer<typeof solarSystemSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
