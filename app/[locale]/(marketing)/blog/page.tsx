import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Clock, BookOpen, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'ar' ? 'المدونة' : 'Blog' };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
  } catch { /* DB not connected */ }

  const demoPost = {
    id: 'demo',
    slug: 'getting-started-solar',
    titleAr: 'كيف تختار النظام الشمسي المناسب لمنزلك؟',
    titleEn: 'How to Choose the Right Solar System for Your Home?',
    excerptAr: 'دليل شامل يساعدك في اتخاذ القرار الصحيح عند شراء نظام طاقة شمسية لمنزلك أو عملك.',
    excerptEn: 'A comprehensive guide to help you make the right decision when buying a solar energy system for your home or business.',
    category: locale === 'ar' ? 'دليل المشتري' : 'Buyer Guide',
    readingTime: 5,
    publishedAt: new Date(),
    tags: ['solar', 'guide'],
  };

  const displayPosts = posts.length > 0 ? posts : [demoPost, demoPost, demoPost];

  const categories = locale === 'ar'
    ? ['الكل', 'دليل المشتري', 'تقنيات', 'توفير الطاقة', 'أخبار']
    : ['All', 'Buyer Guide', 'Technology', 'Energy Saving', 'News'];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {locale === 'ar' ? 'مدونة سولار برو' : 'SolarPro Blog'}
          </h1>
          <p className="text-lg opacity-80">
            {locale === 'ar'
              ? 'أحدث المقالات والأخبار في عالم الطاقة الشمسية'
              : 'Latest articles and news in the solar energy world'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button key={cat}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: cat === categories[0] ? 'var(--solar-gold)' : 'var(--bg-card)',
                color: cat === categories[0] ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post, i) => {
            const title = locale === 'ar' ? post.titleAr : post.titleEn;
            const excerpt = locale === 'ar' ? post.excerptAr : post.excerptEn;
            const isDemo = post.id === 'demo';

            return (
              <div key={`${post.id}-${i}`}
                className="rounded-2xl overflow-hidden card-hover flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {/* Cover */}
                <div className="h-48 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, var(--solar-gold)22, var(--solar-gold)44)` }}>
                  <ImageWithFallback
                    src={post.coverImage || ''}
                    alt={locale === 'ar' ? post.titleAr : post.titleEn}
                    className="absolute inset-0 w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 opacity-30" style={{ color: 'var(--solar-gold)' }} />
                      </div>
                    }
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Clock className="h-3 w-3" />
                      {post.readingTime} {locale === 'ar' ? 'دقيقة' : 'min'}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-3 flex-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    {excerpt}
                  </p>

                  {/* Tags */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(post.tags as string[]).slice(0, 3).map((tag: string) => (
                        <span key={tag}
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(245,166,35,0.1)', color: 'var(--solar-gold)' }}>
                          <Tag className="h-2.5 w-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {post.publishedAt && (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-PS' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {!isDemo ? (
                      <Link href={`/${locale}/blog/${post.slug}`}
                        className="flex items-center gap-1 text-sm font-semibold hover:opacity-75 transition-opacity"
                        style={{ color: 'var(--solar-gold)' }}>
                        {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-semibold opacity-40"
                        style={{ color: 'var(--solar-gold)' }}>
                        {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
