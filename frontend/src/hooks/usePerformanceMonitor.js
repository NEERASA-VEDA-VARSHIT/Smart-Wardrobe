import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} Performance:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        timestamp: new Date().toISOString()
      });
    }

    // Update start time for next render
    renderStartTime.current = performance.now();
  });

  // Monitor memory usage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = performance.memory;
      console.log(`💾 ${componentName} Memory Usage:`, {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }, []);

  return {
    renderCount: renderCount.current
  };
};

export default usePerformanceMonitor;
