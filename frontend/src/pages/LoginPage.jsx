import { lazy, Suspense } from 'react';

const Auth = lazy(() => import('../components/Auth'));

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👔 Smart Wardrobe</h1>
          <p className="text-gray-600">Your intelligent clothing management system</p>
        </div>
        
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <Auth onLogin={onLogin} />
        </Suspense>
      </div>
    </div>
  );
}

export default LoginPage;
