/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { POST as postLead, GET as getLeads } from './leads/route';
import { POST as uploadFile } from './upload/route';
import { POST as postBlog } from './admin/blog/route';
import { prisma } from '@/lib/prisma';

// 1. Setup Mocks
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    media: { create: jest.fn() },
    blogPost: { create: jest.fn() },
    rateLimit: { upsert: jest.fn() },
    user: { findUnique: jest.fn() }, // Added user mock
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve({ user: { email: 'admin@solarpro.ps' } })), // Email is key now
}));

jest.mock('@/lib/tenant', () => ({
  getTenant: jest.fn(() => Promise.resolve({ 
    userId: 'user_123', 
    user: { id: 'user_123', email: 'admin@solarpro.ps', role: 'ADMIN', plan: 'PRO' } 
  })),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ success: true, resetAt: new Date() })),
}));

jest.mock('@/lib/cloudinary', () => ({
  uploadImage: jest.fn(() => Promise.resolve({ 
    url: 'https://cdn.example.com/test.jpg', 
    publicId: 'test_id', 
    format: 'jpg', 
    width: 800, 
    height: 600 
  })),
}));

describe('API Integration Tests', () => {

  describe('Leads API (/api/leads)', () => {
    test('POST: rejects invalid lead data (Zod)', async () => {
      const invalidData = { name: 'John', phone: '123' }; // Missing required fields
      const req = new NextRequest('http://localhost/api/leads', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const res = await postLead(req);
      const data = await res.json();
      expect(res.status).toBe(422);
      expect(data.error).toBeDefined();
    });

    test('POST: accepts valid lead and saves to DB', async () => {
      const validData = {
        name: 'John Doe',
        phone: '0599123456',
        location: 'Ramallah',
        usageType: 'RESIDENTIAL',
        monthlyBillIls: 500,
      };
      
      (prisma.lead.create as jest.Mock).mockResolvedValue({ id: 'lead_1', ...validData });

      const req = new NextRequest('http://localhost/api/leads', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      const res = await postLead(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.lead.create).toHaveBeenCalled();
    });
  });

  describe('Upload API (/api/upload)', () => {
    test('POST: blocks non-image file types', async () => {
      // In node environment with our polyfill, we simulate a file
      const formData = new FormData();
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      formData.append('file', blob, 'test.pdf');

      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadFile(req);
      const data = await res.json();
      expect(res.status).toBe(422);
      expect(data.error).toBe('Only image files are allowed');
    });
  });

  describe('Admin Blog API (/api/admin/blog)', () => {
    test('POST: requires valid session and role (Middleware-simulated)', async () => {
      // Note: Actual middleware check happens before the route handler, 
      // but we test the handler's internal validation too.
      const validBlog = {
        slug: 'new-technology-2026',
        titleAr: 'تقنية شمسية جديدة ومبتكرة',
        titleEn: 'New Innovative Solar Technology',
        contentAr: 'هذا محتوى تجريبي طويل جداً يتجاوز العشرة أحرف المطلوبة للتحقق من الصحة',
        contentEn: 'This is a long test content that exceeds the ten characters required for validation.',
        excerptAr: 'مقتطف قصير للتدوينة الجديدة',
        excerptEn: 'Short excerpt for the new blog post',
        coverImage: 'https://example.com/blog-img.jpg',
        category: 'solar',
        readingTime: 5,
        isPublished: true,
        tags: ['solar', 'tech']
      };

      (prisma.blogPost.create as jest.Mock).mockResolvedValue({ id: 'blog_1', ...validBlog });

      const req = new NextRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify(validBlog),
      });

      const res = await postBlog(req);
      expect(res.status).toBe(200);
      expect(prisma.blogPost.create).toHaveBeenCalled();
    });

    test('POST: fails if required fields are missing', async () => {
      const incompleteBlog = { titleAr: 'No slug here' };
      const req = new NextRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify(incompleteBlog),
      });

      const res = await postBlog(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

});
