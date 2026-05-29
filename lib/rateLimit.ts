import { prisma } from './prisma';

/**
 * IP-based rate limiting compatible with serverless environments.
 * Uses Prisma (Database) as a shared store to ensure consistency across multiple instances.
 * 
 * @param key Unique key for rate limiting (e.g., 'ip:endpoint')
 * @param limit Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 * @returns {Promise<{ success: boolean; count: number; resetAt: Date }>}
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; count: number; resetAt: Date }> {
  const now = new Date();
  
  try {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!rateLimit || now > rateLimit.resetAt) {
      // New window or expired, reset count
      const resetAt = new Date(now.getTime() + windowMs);
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, resetAt },
        create: { key, count: 1, resetAt },
      });
      return { success: true, count: 1, resetAt };
    }

    if (rateLimit.count >= limit) {
      return { success: false, count: rateLimit.count, resetAt: rateLimit.resetAt };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { success: true, count: updated.count, resetAt: updated.resetAt };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On DB failure, BLOCK the request (fail-closed for security)
    return { success: false, count: 0, resetAt: new Date(now.getTime() + 60000) };
  }
}
