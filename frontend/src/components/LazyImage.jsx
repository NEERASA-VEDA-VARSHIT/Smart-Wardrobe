import { useState, useRef, useEffect } from 'react';
import { getOptimalImageUrl, generateBlurPlaceholder } from '../utils/imageOptimization';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = generateBlurPlaceholder(200, 200),
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
  width = 400,
  height = 400,
  quality = 80,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && !isInView) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [imageRef, isInView]);

  useEffect(() => {
    if (isInView && src) {
      // Get optimal image URL based on container dimensions
      const containerWidth = width || 400;
      const containerHeight = height || 400;
      const optimizedSrc = getOptimalImageUrl(src, containerWidth, containerHeight);
      
      const img = new Image();
      img.onload = () => {
        setImageSrc(optimizedSrc);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Graceful fallback on image load failure
        setImageSrc(fallback || placeholder);
        setHasError(true);
      };
      img.src = optimizedSrc;
    }
  }, [isInView, src, fallback, width, height, quality]);

  return (
    <div 
      ref={setImageRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-70'
        } ${hasError ? 'grayscale' : ''}`}
        loading="lazy"
        decoding="async"
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
