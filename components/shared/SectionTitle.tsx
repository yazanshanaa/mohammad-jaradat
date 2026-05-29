import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  highlight?: string;
}

export function SectionTitle({
  title,
  subtitle,
  centered = true,
  className,
  highlight,
}: SectionTitleProps) {
  const renderTitle = () => {
    if (!highlight) return title;
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: 'var(--solar-gold)' }}>{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className={cn('mb-12', centered && 'text-center', className)}>
      <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        {renderTitle()}
      </h2>
      {subtitle && (
        <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)', margin: centered ? '0 auto' : undefined }}>
          {subtitle}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2" style={{ justifyContent: centered ? 'center' : 'flex-start' }}>
        <div className="h-1 w-12 rounded-full" style={{ backgroundColor: 'var(--solar-gold)' }} />
        <div className="h-1 w-4 rounded-full" style={{ backgroundColor: 'var(--eco-green)' }} />
      </div>
    </div>
  );
}
