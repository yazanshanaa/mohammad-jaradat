/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      create: jest.fn(),
    },
  },
}));

describe('Admin Blog API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 if validation fails', async () => {
    const invalidBody = {
      titleAr: 'اختبار',
      // missing slug, readingTime, etc.
    };

    const req = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  test('successfully creates a post with valid data', async () => {
    const validBody = {
      slug: 'test-post',
      titleAr: 'عنوان الاختبار',
      titleEn: 'Test Title',
      contentAr: 'محتوى الاختبار',
      contentEn: 'Test content',
      excerptAr: 'مقتطف الاختبار',
      excerptEn: 'Test excerpt',
      coverImage: 'https://example.com/image.jpg',
      category: 'solar',
      readingTime: 5,
      isPublished: true,
      tags: ['solar', 'energy'],
    };

    const mockPost = { id: '1', ...validBody, tags: [] };
    (prisma.blogPost.create as jest.Mock).mockResolvedValue(mockPost);

    const req = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slug).toBe('test-post');
    expect(prisma.blogPost.create).toHaveBeenCalled();
  });
});
