import { useState } from 'react';

function WardrobeFilters({ clothes, onFilterChange, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    color: '',
    occasion: '',
    status: ''
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({ type: '', color: '', occasion: '', status: '' });
    setSearchTerm('');
    onFilterChange({ type: '', color: '', occasion: '', status: '' });
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== '';

  // Get unique values for filter options
  const types = [...new Set(clothes.map(c => c.type).filter(Boolean))];
  const colors = [...new Set(clothes.map(c => c.color).filter(Boolean))];
  const occasions = [...new Set(clothes.map(c => c.occasion).filter(Boolean))];

  const statusOptions = [
    { value: 'available', label: 'Available', icon: '✅' },
    { value: 'worn', label: 'Currently Worn', icon: '👕' },
    { value: 'dirty', label: 'Needs Cleaning', icon: '🧺' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search your wardrobe... (e.g., 'red shirt', 'jeans')"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
            showFilters
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <span>Filters</span>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color} className="capitalize">{color}</option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
            <select
              value={filters.occasion}
              onChange={(e) => handleFilterChange('occasion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Occasions</option>
              {occasions.map(occasion => (
                <option key={occasion} value={occasion} className="capitalize">{occasion}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {filters.type}
            </span>
          )}
          {filters.color && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Color: {filters.color}
            </span>
          )}
          {filters.occasion && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Occasion: {filters.occasion}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Status: {filters.status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default WardrobeFilters;
