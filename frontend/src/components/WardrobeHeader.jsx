import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WardrobeHeader({ 
  onSearch, 
  onFilterChange, 
  onAddItem, 
  totalItems, 
  availableItems, 
  wornItems, 
  dirtyItems 
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    occasion: '',
    color: '',
    cleanliness: ''
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
    setFilters({ category: '', occasion: '', color: '', cleanliness: '' });
    setSearchTerm('');
    onSearch('');
    onFilterChange({ category: '', occasion: '', color: '', cleanliness: '' });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== '';

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
  const occasions = ['All', 'Casual', 'Work', 'Party', 'Formal', 'Sport', 'Date', 'Travel'];
  const colors = ['All', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray'];
  const cleanlinessOptions = ['All', 'Clean', 'Needs Cleaning', 'Currently Worn'];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row - Logo and Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Project Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MW</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">MyWardrobe</h1>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => navigate('/')}
                className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1"
              >
                Wardrobe
              </button>
              <button 
                onClick={() => navigate('/review')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Outfit Builder
              </button>
              <button 
                onClick={() => navigate('/collaboration')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Shared
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-900 transition-colors">
                Profile
              </button>
            </nav>
          </div>

          {/* Right Side - Stats and Add Button */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{availableItems} Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{wornItems} Worn</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{dirtyItems} Dirty</span>
              </div>
            </div>

            {/* Add New Item Button */}
            <button
              onClick={onAddItem}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add New Item</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, color, or type..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Dropdowns */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All' ? '' : category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.occasion}
                  onChange={(e) => handleFilterChange('occasion', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {occasions.map(occasion => (
                    <option key={occasion} value={occasion === 'All' ? '' : occasion.toLowerCase()}>
                      {occasion}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {colors.map(color => (
                    <option key={color} value={color === 'All' ? '' : color.toLowerCase()}>
                      {color}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.cleanliness}
                  onChange={(e) => handleFilterChange('cleanliness', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {cleanlinessOptions.map(option => (
                    <option key={option} value={option === 'All' ? '' : option.toLowerCase().replace(' ', '')}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                </span>
              )}
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {key}: {value}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default WardrobeHeader;
