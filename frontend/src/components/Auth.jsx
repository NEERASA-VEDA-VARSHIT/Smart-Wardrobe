import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login onLogin={onLogin} />
      ) : (
        <Register onLogin={onLogin} />
      )}
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
