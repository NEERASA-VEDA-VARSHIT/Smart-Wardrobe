import { useState } from 'react';

function AdvancedFilters({ clothes, onFilterChange }) {
  const [filters, setFilters] = useState({
    type: '',
    color: '',
    occasion: '',
    washStatus: '',
    sortBy: 'recent'
  });

  // Get unique values for filter options
  const types = [...new Set(clothes.map(c => c.type))].sort();
  const colors = [...new Set(clothes.map(c => c.color))].sort();
  const occasions = [...new Set(clothes.map(c => c.occasion || 'casual'))].sort();

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      type: '',
      color: '',
      occasion: '',
      washStatus: '',
      sortBy: 'recent'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getFilteredCount = () => {
    return clothes.filter(cloth => {
      if (filters.type && cloth.type !== filters.type) return false;
      if (filters.color && !cloth.color?.toLowerCase().includes(filters.color.toLowerCase())) return false;
      if (filters.occasion && (cloth.occasion || 'casual') !== filters.occasion) return false;
      if (filters.washStatus === 'clean' && cloth.needsCleaning) return false;
      if (filters.washStatus === 'dirty' && !cloth.needsCleaning) return false;
      return true;
    }).length;
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Advanced Filters</h2>
        <div className="text-sm text-gray-600">
          Showing {getFilteredCount()} of {clothes.length} items
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">👕 Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="select-field"
          >
            <option value="">All types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🎨 Color</label>
          <input
            type="text"
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            placeholder="e.g., blue, red"
            className="input-field"
          />
        </div>

        {/* Occasion Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🎉 Occasion</label>
          <select
            value={filters.occasion}
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
            className="select-field"
          >
            <option value="">All occasions</option>
            {occasions.map(occasion => (
              <option key={occasion} value={occasion}>{occasion}</option>
            ))}
          </select>
        </div>

        {/* Wash Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">✅ Wash Status</label>
          <select
            value={filters.washStatus}
            onChange={(e) => handleFilterChange('washStatus', e.target.value)}
            className="select-field"
          >
            <option value="">All items</option>
            <option value="clean">Clean only</option>
            <option value="dirty">Needs washing</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="select-field"
          >
            <option value="recent">Most recent</option>
            <option value="name">Name A-Z</option>
            <option value="type">Type</option>
            <option value="color">Color</option>
            <option value="occasion">Occasion</option>
            <option value="lastWorn">Last worn</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={resetFilters}
          className="btn-secondary text-sm"
        >
          Clear all filters
        </button>
        
        <div className="text-xs text-gray-500">
          {Object.values(filters).filter(v => v !== '').length > 0 && (
            <span className="text-indigo-600">
              {Object.values(filters).filter(v => v !== '').length} filter(s) active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedFilters;
