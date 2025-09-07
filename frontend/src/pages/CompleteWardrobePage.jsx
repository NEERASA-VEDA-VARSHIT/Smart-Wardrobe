import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClothes, updateCloth, deleteCloth } from '../api';
import { handleApiError } from '../utils/errorHandler';
import WardrobeHeader from '../components/WardrobeHeader';
import WardrobeCloset from '../components/WardrobeCloset';
import ItemDetailsPanel from '../components/ItemDetailsPanel';
import WardrobeFooter from '../components/WardrobeFooter';

function CompleteWardrobePage() {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    occasion: '',
    color: '',
    cleanliness: ''
  });

  // Load clothes on component mount
  useEffect(() => {
    loadClothes();
  }, []);

  // Apply filters whenever clothes or filters change
  useEffect(() => {
    applyFilters();
  }, [clothes, filters, searchTerm]);

  const loadClothes = async () => {
    setLoading(true);
    try {
      const res = await getClothes();
      const clothesData = res.data || [];
      setClothes(clothesData);
    } catch (error) {
      handleApiError(error, 'Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clothes];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      const categoryMap = {
        'tops': ['shirt', 'blouse', 't-shirt', 'tank', 'polo', 'sweater'],
        'bottoms': ['jeans', 'pants', 'shorts', 'trousers'],
        'outerwear': ['jacket', 'blazer', 'cardigan', 'hoodie', 'coat'],
        'shoes': ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats'],
        'accessories': ['hat', 'cap', 'belt', 'bag', 'purse', 'scarf', 'tie']
      };
      
      if (categoryMap[filters.category]) {
        filtered = filtered.filter(c => 
          categoryMap[filters.category].includes(c.type?.toLowerCase())
        );
      }
    }

    // Apply occasion filter
    if (filters.occasion) {
      filtered = filtered.filter(c => 
        (c.occasion || 'casual').toLowerCase() === filters.occasion
      );
    }

    // Apply color filter
    if (filters.color) {
      filtered = filtered.filter(c => 
        c.color?.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    // Apply cleanliness filter
    if (filters.cleanliness) {
      switch (filters.cleanliness) {
        case 'clean':
          filtered = filtered.filter(c => !c.needsCleaning && !c.worn);
          break;
        case 'needs cleaning':
          filtered = filtered.filter(c => c.needsCleaning);
          break;
        case 'currently worn':
          filtered = filtered.filter(c => c.worn);
          break;
      }
    }

    setFilteredClothes(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddItem = () => {
    navigate('/add');
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const markWorn = async (id) => {
    try {
      const cloth = clothes.find(c => c._id === id);
      const formData = new FormData();
      
      if (!cloth.worn) {
        formData.append('action', 'markWorn');
      } else {
        formData.append('action', 'markUnworn');
      }
      
      const res = await updateCloth(id, formData);
      const updatedCloth = res.data;
      setClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
      
      // Update selected item if it's the one being modified
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(updatedCloth);
      }
    } catch (error) {
      handleApiError(error, 'Failed to update item status');
    }
  };

  const toggleWash = async (id) => {
    try {
      const cloth = clothes.find(c => c._id === id);
      const formData = new FormData();
      
      if (cloth.needsCleaning) {
        formData.append('action', 'cleaned');
      } else {
        formData.append('action', 'markClean');
      }
      
      const res = await updateCloth(id, formData);
      const updatedCloth = res.data;
      setClothes((prev) => prev.map((c) => (c._id === id ? updatedCloth : c)));
      
      // Update selected item if it's the one being modified
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(updatedCloth);
      }
    } catch (error) {
      handleApiError(error, 'Failed to update wash status');
    }
  };

  const removeCloth = async (id) => {
    try {
      await deleteCloth(id);
      setClothes((prev) => prev.filter((c) => c._id !== id));
      
      // Clear selected item if it's the one being deleted
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete item');
    }
  };

  const handleAddToOutfit = (item) => {
    // Navigate to outfit builder with the selected item
    navigate('/review', { state: { selectedItem: item } });
  };

  // Calculate stats
  const stats = {
    total: clothes.length,
    available: clothes.filter(c => !c.worn && !c.needsCleaning).length,
    worn: clothes.filter(c => c.worn).length,
    dirty: clothes.filter(c => c.needsCleaning).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading your wardrobe...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WardrobeHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAddItem={handleAddItem}
        totalItems={stats.total}
        availableItems={stats.available}
        wornItems={stats.worn}
        dirtyItems={stats.dirty}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* Wardrobe Closet */}
          <div className="flex-1">
            <WardrobeCloset
              clothes={filteredClothes}
              onItemClick={handleItemClick}
              onMarkWorn={markWorn}
              onToggleWash={toggleWash}
              onDelete={removeCloth}
            />
          </div>

          {/* Item Details Panel */}
          <div className="lg:w-80 flex-shrink-0">
            <ItemDetailsPanel
              selectedItem={selectedItem}
              onMarkWorn={markWorn}
              onToggleWash={toggleWash}
              onDelete={removeCloth}
              onAddToOutfit={handleAddToOutfit}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <WardrobeFooter clothes={clothes} />
    </div>
  );
}

export default CompleteWardrobePage;
