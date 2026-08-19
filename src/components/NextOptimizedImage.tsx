import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export interface NextOptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: any;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
}

/**
 * High-performance Next.js Image component wrapper.
 * Leverages next/image with resilient unoptimized fallback for remote domains,
 * ensuring flawless rendering in both Next.js and Vite environments.
 */
export function NextOptimizedImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
  className = '',
  width = 500,
  height = 500,
  fill,
  priority = false,
  unoptimized = true,
  ...props
}: NextOptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<any>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        unoptimized={true}
        onError={handleError}
        {...props}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      unoptimized={true}
      onError={handleError}
      {...props}
    />
  );
}

export default NextOptimizedImage;
