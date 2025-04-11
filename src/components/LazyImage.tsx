import React from 'react';
import { useImageLazyLoading } from '../hooks/useImageLazyLoading';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
}

export function LazyImage({ src, alt, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMEYxNDI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==', ...props }: LazyImageProps) {
  const imageRef = useImageLazyLoading();

  return (
    <img
      ref={imageRef}
      src={placeholder}
      data-src={src}
      alt={alt}
      {...props}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.src = placeholder;
      }}
    />
  );
}