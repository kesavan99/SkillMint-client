import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill';
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage component that uses Netlify Image CDN for automatic optimization
 * Supports automatic format selection (WebP/AVIF), responsive sizing, and quality control
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fit = 'contain',
  quality = 75,
  className = '',
  style,
  onClick,
  onError,
  loading = 'lazy'
}) => {
  const [imageError, setImageError] = useState(false);

  // Build Netlify Image CDN URL
  const buildImageUrl = (source: string): string => {
    // If it's already a Netlify Images URL or external, use as-is
    if (source.startsWith('/.netlify/images') || source.startsWith('http')) {
      return source;
    }

    // Build query parameters for Netlify Image CDN
    const params = new URLSearchParams();
    params.append('url', source);
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (fit !== 'contain') params.append('fit', fit);
    if (quality !== 75) params.append('q', quality.toString());

    return `/.netlify/images?${params.toString()}`;
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    if (onError) {
      onError(e);
    }
  };

  // Fallback to original image if Netlify CDN fails
  const imageSrc = imageError ? src : buildImageUrl(src);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onClick={onClick}
      onError={handleError}
      loading={loading}
    />
  );
};

export default OptimizedImage;
