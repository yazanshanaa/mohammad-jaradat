import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

  // Cloudinary (optional — features degrade gracefully)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Email (optional — emails silently skipped if not set)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  CONTACT_EMAIL: z.string().email().optional(),

  // Public
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map(e => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${missing}`);
  }

  return result.data;
}

// Validate once at startup (server-side only)
let _env: Env | null = null;

export function getEnv(): Env {
  if (typeof window !== 'undefined') {
    throw new Error('getEnv() must only be called on the server side');
  }
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

// Export individual vars for convenience (typed, never undefined for required fields)
export const env = {
  get DATABASE_URL() { return getEnv().DATABASE_URL; },
  get AUTH_SECRET() { return getEnv().AUTH_SECRET; },
  get NEXTAUTH_URL() { return getEnv().NEXTAUTH_URL; },
  get CLOUDINARY_CLOUD_NAME() { return getEnv().CLOUDINARY_CLOUD_NAME; },
  get CLOUDINARY_API_KEY() { return getEnv().CLOUDINARY_API_KEY; },
  get CLOUDINARY_API_SECRET() { return getEnv().CLOUDINARY_API_SECRET; },
  get RESEND_API_KEY() { return getEnv().RESEND_API_KEY; },
  get RESEND_FROM_EMAIL() { return getEnv().RESEND_FROM_EMAIL; },
  get CONTACT_EMAIL() { return getEnv().CONTACT_EMAIL; },
  get NEXT_PUBLIC_SITE_URL() { return getEnv().NEXT_PUBLIC_SITE_URL; },
  get NEXT_PUBLIC_WHATSAPP_NUMBER() { return getEnv().NEXT_PUBLIC_WHATSAPP_NUMBER; },
};
