import { useState, useEffect } from 'react';
import { calculateStorageUsage } from '../utils/imageOptimization';

const StorageMonitor = ({ images = [], className = '' }) => {
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    if (images.length > 0) {
      const info = calculateStorageUsage(images);
      setStorageInfo(info);
    }
  }, [images]);

  if (!storageInfo) return null;

  const { usagePercentage, totalSizeMB, remainingMB } = storageInfo;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 95;

  return (
    <div className={`p-4 rounded-lg border ${isAtLimit ? 'bg-red-50 border-red-200' : isNearLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Storage Usage</h3>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'}`}>
          {usagePercentage}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      
      {/* Storage Details */}
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Used:</span>
          <span>{totalSizeMB} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Remaining:</span>
          <span>{remainingMB} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Free Tier Limit:</span>
          <span>500 MB</span>
        </div>
      </div>
      
      {/* Warning Messages */}
      {isAtLimit && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
          ⚠️ Storage limit nearly reached! Consider deleting unused images.
        </div>
      )}
      
      {isNearLimit && !isAtLimit && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-700">
          ⚡ Storage usage is high. Monitor your image uploads.
        </div>
      )}
      
      {!isNearLimit && (
        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
          ✅ Storage usage is healthy. You have plenty of space remaining.
        </div>
      )}
    </div>
  );
};

export default StorageMonitor;
