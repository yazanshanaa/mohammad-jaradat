import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Clock, Calendar, Tag, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLocalized } from '@/lib/utils';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const post = await prisma.blogPost.findFirst({ where: { slug } });
    if (!post) return {};
    return {
      title: getLocalized(post, 'title', locale),
      description: getLocalized(post, 'metaDesc', locale) || getLocalized(post, 'excerpt', locale),
    };
  } catch { return {}; }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;

  let post: any = null;
  try {
    post = await prisma.blogPost.findFirst({ where: { slug, isPublished: true } });
  } catch { /* DB not connected */ }

  if (!post) notFound();

  const title = getLocalized(post, 'title', locale);
  const content = getLocalized(post, 'content', locale);
  const excerpt = getLocalized(post, 'excerpt', locale);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href={`/${locale}`} style={{ color: 'var(--solar-gold)' }}>{locale === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <Link href={`/${locale}/blog`} style={{ color: 'var(--solar-gold)' }}>{locale === 'ar' ? 'المدونة' : 'Blog'}</Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <span className="truncate" style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} {locale === 'ar' ? 'دقيقة قراءة' : 'min read'}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-PS' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {excerpt}
          </p>
        </header>

        {/* Cover */}
        <div className="h-64 rounded-2xl mb-10 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--solar-gold)22, var(--solar-gold)44)' }}>
          <span className="text-6xl">☀️</span>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-10"
          style={{ color: 'var(--text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag: string) => (
              <span key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: 'rgba(245,166,35,0.1)', color: 'var(--solar-gold)' }}>
                <Tag className="h-3 w-3" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
          <h3 className="text-xl font-bold text-white mb-3">
            {locale === 'ar' ? 'هل أنت مستعد لتوفير الطاقة؟' : 'Ready to Save on Energy?'}
          </h3>
          <p className="text-white/75 mb-6">
            {locale === 'ar'
              ? 'احصل على استشارة مجانية وعرض سعر مخصص'
              : 'Get a free consultation and customized quote'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="font-bold text-white" style={{ backgroundColor: 'var(--solar-gold)' }}>
              <Link href={`/${locale}/contact`}>
                {locale === 'ar' ? 'احصل على عرض مجاني' : 'Get Free Quote'}
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Link href={`/${locale}/calculator`}>
                {locale === 'ar' ? 'احسب توفيرك' : 'Calculate Savings'}
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
