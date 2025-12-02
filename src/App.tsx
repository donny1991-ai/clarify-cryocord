import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Login } from './components/Login';
import { MainApp } from './components/MainApp';
import { AdminPanel } from './components/AdminPanel';
import { ViewType } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('login');

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      // If user is logged out, go back to login
      if (!firebaseUser) {
        setCurrentView('login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setCurrentView('app');
  };

  const handleSwitchToAdmin = () => {
    setCurrentView('admin');
  };

  const handleSwitchToApp = () => {
    setCurrentView('app');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-[#B01E2D] mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login view if user is not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show the current view based on state
  switch (currentView) {
    case 'app':
      return <MainApp onSwitchToAdmin={handleSwitchToAdmin} userEmail={user.email} />;
    case 'admin':
      return <AdminPanel onSwitchToApp={handleSwitchToApp} />;
    default:
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }
}

export default App;
