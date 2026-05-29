'use client';

import { useState } from 'react';
import NextImage from 'next/image';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function ImageWithFallback({ src, alt, className, fallback, width, height, fill }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setFailed(true)}
        unoptimized
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
