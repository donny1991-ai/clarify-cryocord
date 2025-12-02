import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      
      // User-friendly error messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full relative flex-col lg:flex-row fade-in">
      {/* Ambient Background */}
      <div id="ambient-background" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Cell 1 */}
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] cell-1">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/40 to-red-200/30 blur-sm"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-100/30 to-red-100/20"></div>
          <div className="nucleus absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-red-300/40 to-pink-300/30"></div>
          <div className="absolute top-[30%] left-[25%] w-8 h-8 rounded-full bg-red-200/30"></div>
        </div>

        {/* Cell 2 */}
        <div className="absolute top-[40%] right-[8%] w-[320px] h-[320px] cell-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200/35 to-pink-200/25 blur-sm"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-rose-100/25 to-pink-100/15"></div>
          <div className="nucleus absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-rose-300/35 to-red-300/25"></div>
          <div className="absolute top-[25%] left-[70%] w-7 h-7 rounded-full bg-rose-200/25"></div>
        </div>

        {/* Cell 3 */}
        <div className="absolute bottom-[15%] left-[25%] w-[280px] h-[280px] cell-3">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-200/30 to-rose-200/20 blur-sm"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-100/20 to-rose-100/15"></div>
          <div className="nucleus absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-red-300/30 to-rose-300/20"></div>
        </div>

        {/* Cell 4 */}
        <div className="absolute top-[8%] right-[18%] w-[240px] h-[240px] cell-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/28 to-red-200/18 blur-sm"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-100/18 to-red-100/12"></div>
          <div className="nucleus absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-pink-300/28 to-red-300/18"></div>
        </div>

        {/* Particles */}
        <div className="absolute top-[20%] right-[30%] w-3 h-3 rounded-full bg-red-400/40 particle-1"></div>
        <div className="absolute bottom-[30%] left-[40%] w-2 h-2 rounded-full bg-pink-400/35 particle-2"></div>
        <div className="absolute top-[60%] right-[15%] w-2.5 h-2.5 rounded-full bg-rose-400/30 particle-3"></div>
      </div>

      {/* Left Side - Brand Experience */}
      <div className="relative flex flex-col justify-center p-8 lg:p-24 w-full lg:w-1/2 min-h-[40vh] lg:min-h-auto z-10">
        <div className="relative z-10 max-w-md space-y-6">
          <div className="mb-8">
            <img 
              src="/clarify-logo-v3.png" 
              alt="Clarify by CryoCord" 
              className="object-contain" 
              style={{ width: '400px', height: '133px' }}
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-800">
            Clear answers, clarity, for every customer.
          </h1>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-white p-8 lg:p-24 shadow-xl z-20 min-h-[60vh] lg:min-h-auto">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-800">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-600">
              Enter your credentials to access the secure portal
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-800">
                  Email Address
                </label>
                <input
                  id="email"
                  placeholder="name@cryocord.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="flex h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01E2D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-800">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="flex h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01E2D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01E2D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#B01E2D] text-white hover:bg-red-700 h-12 w-full text-base"
            >
              {loading ? 'Signing in...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
