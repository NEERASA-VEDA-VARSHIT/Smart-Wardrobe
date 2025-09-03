import { useEffect, useState } from "react";
import UploadForm from "./components/UploadForm";
import Gallery from "./components/Gallery";
import Auth from "./components/Auth";
import { getClothes, createCloth, updateCloth, deleteCloth } from "./api";
import "./index.css";

function App() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    // Clear any existing tokens to force fresh login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthLoading(false);
  }, []);

  // Load clothes when user is authenticated
  useEffect(() => {
    if (user) {
      // Add a small delay to ensure token is properly set
      setTimeout(async () => {
        try {
          const res = await getClothes();
          setClothes(res.data || []);
        } catch (e) {
          console.error('Error loading clothes:', e);
          alert('Failed to load wardrobe: ' + e.message);
        } finally {
          setLoading(false);
        }
      }, 100);
    } else {
      // If no user, set loading to false and clear clothes
      setLoading(false);
      setClothes([]);
    }
  }, [user]);

  const addCloth = async (formData) => {
    try {
      const res = await createCloth(formData);
      setClothes((prev) => [...prev, res.data]);
    } catch (error) {
      console.error('Error adding cloth:', error);
      alert('Failed to add item: ' + error.message);
    }
  };

  const markWorn = async (id) => {
    const cloth = clothes.find(c => c._id === id);
    const formData = new FormData();
    formData.append('worn', !cloth.worn);
    formData.append('lastWorn', !cloth.worn ? new Date().toISOString() : null);
    const res = await updateCloth(id, formData);
    setClothes((prev) => prev.map((c) => (c._id === id ? res.data : c)));
  };

  const toggleWash = async (id) => {
    const cloth = clothes.find(c => c._id === id);
    const formData = new FormData();
    formData.append('washed', !cloth.washed);
    const res = await updateCloth(id, formData);
    setClothes((prev) => prev.map((c) => (c._id === id ? res.data : c)));
  };

  const removeCloth = async (id) => {
    await deleteCloth(id);
    setClothes((prev) => prev.filter((c) => c._id !== id));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setLoading(true); // This will trigger the useEffect to load clothes
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setClothes([]);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading...</div>
          <div className="text-gray-600">Checking authentication</div>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👔 Smart Wardrobe</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Sign out
          </button>
        </div>

        <UploadForm onAddItem={addCloth} />
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl">Loading your wardrobe...</div>
          </div>
        ) : (
          <Gallery 
            clothes={clothes}
            onMarkWorn={markWorn}
            onToggleWash={toggleWash}
            onDelete={removeCloth}
          />
        )}
      </div>
    </div>
  );
}

export default App;
