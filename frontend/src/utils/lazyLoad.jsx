import { lazy, Suspense, createElement } from 'react';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Default loading component
const DefaultLoading = () => <LoadingSpinner />;

// Higher-order component for lazy loading with error boundary
export const withLazyLoad = (importFunc, fallback = DefaultLoading) => {
  const LazyComponent = lazy(importFunc);
  
  const WrappedComponent = (props) => (
    <Suspense fallback={createElement(fallback)}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withLazyLoad(${LazyComponent.displayName || LazyComponent.name || 'Component'})`;
  
  return WrappedComponent;
};

// Preload function for critical components
export const preloadComponent = (importFunc) => {
  return () => {
    importFunc();
  };
};

// Lazy load with retry on error
export const withRetry = (importFunc, retries = 3) => {
  return lazy(() => 
    importFunc().catch((error) => {
      if (retries > 0) {
        console.warn(`Failed to load component, retrying... (${retries} attempts left)`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(importFunc()), 1000);
        });
      }
      throw error;
    })
  );
};

export default { withLazyLoad, preloadComponent, withRetry };
