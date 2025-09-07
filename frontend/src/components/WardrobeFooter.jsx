function WardrobeFooter({ clothes }) {
  const stats = {
    total: clothes.length,
    available: clothes.filter(c => !c.worn && !c.needsCleaning).length,
    worn: clothes.filter(c => c.worn).length,
    dirty: clothes.filter(c => c.needsCleaning).length,
    byType: clothes.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {}),
    byColor: clothes.reduce((acc, item) => {
      acc[item.color] = (acc[item.color] || 0) + 1;
      return acc;
    }, {})
  };

  const getMostCommon = (obj) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return 'None';
    return entries.sort(([,a], [,b]) => b - a)[0][0];
  };

  const getMostCommonType = getMostCommon(stats.byType);
  const getMostCommonColor = getMostCommon(stats.byColor);

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Wardrobe Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Items</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.available}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Currently Worn</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.worn}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Needs Cleaning</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.dirty}</span>
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">By Type</h3>
            <div className="space-y-2">
              {Object.entries(stats.byType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Most Common:</span>
                <span className="text-sm font-medium text-indigo-600 capitalize">{getMostCommonType}</span>
              </div>
            </div>
          </div>

          {/* Color Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">By Color</h3>
            <div className="space-y-2">
              {Object.entries(stats.byColor)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([color, count]) => (
                  <div key={color} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></div>
                      <span className="text-sm text-gray-600 capitalize">{color}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Most Common:</span>
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: getMostCommonColor.toLowerCase() }}
                  ></div>
                  <span className="text-sm font-medium text-indigo-600 capitalize">{getMostCommonColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Availability Rate</div>
                  <div className="text-lg font-bold text-blue-900">
                    {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <div className="font-medium">Wardrobe Health</div>
                  <div className="text-lg font-bold text-green-900">
                    {stats.dirty === 0 ? 'Excellent' : stats.dirty <= 3 ? 'Good' : 'Needs Attention'}
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-800">
                  <div className="font-medium">Diversity</div>
                  <div className="text-lg font-bold text-purple-900">
                    {Object.keys(stats.byType).length} Types
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                Export Data
              </button>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                Wardrobe Analytics
              </button>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                Backup Wardrobe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default WardrobeFooter;
