import { lazy, Suspense, useEffect, useState } from 'react';
import { getClothes, updateCloth, deleteCloth } from '../api';
import { handleApiError } from '../utils/errorHandler';

const Gallery = lazy(() => import('../components/Gallery'));
const AdvancedFilters = lazy(() => import('../components/AdvancedFilters'));
const RecommendationEngine = lazy(() => import('../components/RecommendationEngine'));
const OutfitManager = lazy(() => import('../components/OutfitManager'));
const OutfitSuggestions = lazy(() => import('../components/OutfitSuggestions'));
const PhysicalWardrobe = lazy(() => import('../components/PhysicalWardrobe'));
const WardrobeViewSwitcher = lazy(() => import('../components/WardrobeViewSwitcher'));
const WardrobeFilters = lazy(() => import('../components/WardrobeFilters'));

function WardrobePage() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [viewMode, setViewMode] = useState('physical'); // 'physical' or 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [wardrobeFilters, setWardrobeFilters] = useState({
    type: '',
    color: '',
    occasion: '',
    status: ''
  });

  const loadClothes = async () => {
    setLoading(true);
    try {
      const res = await getClothes();
      const clothesData = res.data || [];
      setClothes(clothesData);
      setFilteredClothes(clothesData);
    } catch (e) {
      handleApiError(e, 'Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  // Load clothes when component mounts
  useEffect(() => {
    loadClothes();
  }, []);


  const markWorn = async (id) => {
    try {
      const cloth = clothes.find(c => c._id === id);
      const formData = new FormData();
      
      if (!cloth.worn) {
        // Marking as worn: action = 'markWorn'
        formData.append('action', 'markWorn');
      } else {
        // Marking as unworn: action = 'markUnworn'
        formData.append('action', 'markUnworn');
      }
      
      const res = await updateCloth(id, formData);
      const updatedCloth = res.data;
      console.log('MarkWorn - Updated cloth data:', updatedCloth);
      setClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
      setFilteredClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
    } catch (error) {
      handleApiError(error, 'Failed to update item status');
    }
  };

  const toggleWash = async (id) => {
    try {
      const cloth = clothes.find(c => c._id === id);
      const formData = new FormData();
      
      if (cloth.needsCleaning) {
        // Marking as cleaned (after washing): action = 'cleaned'
        formData.append('action', 'cleaned');
      } else {
        // Marking as needs washing: action = 'markClean' (just mark as needs cleaning)
        formData.append('action', 'markClean');
      }
      
      const res = await updateCloth(id, formData);
      const updatedCloth = res.data;
      console.log('ToggleWash - Updated cloth data:', updatedCloth);
      setClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
      setFilteredClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
    } catch (error) {
      handleApiError(error, 'Failed to update wash status');
    }
  };

  const removeCloth = async (id) => {
    try {
      await deleteCloth(id);
      setClothes((prev) => prev.filter((c) => c._id !== id));
      setFilteredClothes((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      handleApiError(error, 'Failed to delete item');
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...clothes];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    if (filters.color) {
      filtered = filtered.filter(c => c.color?.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters.occasion) {
      filtered = filtered.filter(c => (c.occasion || 'casual') === filters.occasion);
    }
    if (filters.washStatus === 'clean') {
      filtered = filtered.filter(c => !c.needsCleaning);
    }
    if (filters.washStatus === 'dirty') {
      filtered = filtered.filter(c => c.needsCleaning);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          const aTime = new Date(a.lastWorn || a.createdAt || 0).getTime();
          const bTime = new Date(b.lastWorn || b.createdAt || 0).getTime();
          return bTime - aTime;
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'color':
          return (a.color || '').localeCompare(b.color || '');
        case 'occasion':
          return ((a.occasion || 'casual') || '').localeCompare((b.occasion || 'casual') || '');
        case 'lastWorn':
          const aWorn = new Date(a.lastWorn || 0).getTime();
          const bWorn = new Date(b.lastWorn || 0).getTime();
          return bWorn - aWorn;
        default:
          return 0;
      }
    });

    setFilteredClothes(filtered);
  };

  // New filtering logic for physical wardrobe
  const handleWardrobeFilterChange = (filters) => {
    setWardrobeFilters(filters);
    applyWardrobeFilters(filters, searchTerm);
  };

  const handleWardrobeSearch = (term) => {
    setSearchTerm(term);
    applyWardrobeFilters(wardrobeFilters, term);
  };

  const applyWardrobeFilters = (filters, search) => {
    let filtered = [...clothes];

    // Apply search
    if (search) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase()) ||
        c.color.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    if (filters.color) {
      filtered = filtered.filter(c => c.color?.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters.occasion) {
      filtered = filtered.filter(c => (c.occasion || 'casual') === filters.occasion);
    }
    if (filters.status === 'available') {
      filtered = filtered.filter(c => !c.worn && !c.needsCleaning);
    } else if (filters.status === 'worn') {
      filtered = filtered.filter(c => c.worn);
    } else if (filters.status === 'dirty') {
      filtered = filtered.filter(c => c.needsCleaning);
    }

    setFilteredClothes(filtered);
  };

  const handleItemSelect = (item) => {
    // Handle item selection for physical wardrobe
    console.log('Selected item:', item);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wardrobe</h1>
            <p className="text-gray-600">View and manage your clothing collection with photos and smart tracking</p>
          </div>
          <button 
            onClick={loadClothes}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-20 bg-gray-200 rounded"></div></div>}>
        <WardrobeViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
      </Suspense>

      {/* Filters - Different for each view */}
      {viewMode === 'physical' ? (
        <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-20 bg-gray-200 rounded"></div></div>}>
          <WardrobeFilters 
            clothes={clothes} 
            onFilterChange={handleWardrobeFilterChange}
            onSearch={handleWardrobeSearch}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-20 bg-gray-200 rounded"></div></div>}>
          <AdvancedFilters clothes={clothes} onFilterChange={handleFilterChange} />
        </Suspense>
      )}

      {/* Recommendations */}
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></div>}>
        <RecommendationEngine clothes={clothes} />
      </Suspense>

      {/* Friend Suggestions */}
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-40 bg-gray-200 rounded"></div></div>}>
        <OutfitSuggestions />
      </Suspense>

      {/* Outfit Manager */}
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-40 bg-gray-200 rounded"></div></div>}>
        <OutfitManager />
      </Suspense>

      {/* Wardrobe Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading your wardrobe...</div>
        </div>
      ) : viewMode === 'physical' ? (
        <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-64 bg-gray-200 rounded"></div></div>}>
          <PhysicalWardrobe 
            clothes={filteredClothes}
            onMarkWorn={markWorn}
            onToggleWash={toggleWash}
            onDelete={removeCloth}
            onItemSelect={handleItemSelect}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><div className="animate-pulse h-64 bg-gray-200 rounded"></div></div>}>
          <Gallery 
            clothes={filteredClothes}
            onMarkWorn={markWorn}
            onToggleWash={toggleWash}
            onDelete={removeCloth}
          />
        </Suspense>
      )}
    </div>
  );
}

export default WardrobePage;
