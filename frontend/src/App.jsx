import { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { withLazyLoad } from "./utils/lazyLoad.jsx";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages for better performance
const WardrobePage = withLazyLoad(() => import("./pages/WardrobePage"));
const CompleteWardrobePage = withLazyLoad(() => import("./pages/CompleteWardrobePage"));
const AddClothesPage = withLazyLoad(() => import("./pages/AddClothesPage"));
const CollaborationPage = withLazyLoad(() => import("./pages/CollaborationPage"));
const OutfitReviewPage = withLazyLoad(() => import("./pages/OutfitReviewPage"));
const StylistPage = withLazyLoad(() => import("./pages/StylistPage"));
const ProfilePage = withLazyLoad(() => import("./pages/ProfilePage"));

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Performance monitoring
  usePerformanceMonitor('App');

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setAuthLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <ToastContainer newestOnTop closeOnClick pauseOnHover theme="light" />
        <Routes>
          <Route path="/" element={<CompleteWardrobePage />} />
          <Route path="/classic" element={<WardrobePage />} />
          <Route path="/add" element={<AddClothesPage />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
          <Route path="/review" element={<OutfitReviewPage />} />
          <Route path="/stylist/:ownerId" element={<StylistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;