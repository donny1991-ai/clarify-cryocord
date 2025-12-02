import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { BackendResponse, Message } from '../types';

interface MainAppProps {
  onSwitchToAdmin: () => void;
  userEmail: string | null;
}

const BACKEND_URL = 'https://cryocord-sales-query-1034418228298.us-central1.run.app';

export const MainApp: React.FC<MainAppProps> = ({ onSwitchToAdmin, userEmail }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  const getUserInitials = () => {
    if (userEmail) {
      const parts = userEmail.split('@')[0].split('.');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return userEmail.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Get the current user's ID token
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Send request to backend with Authorization header
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ question: question.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data: BackendResponse = await response.json();

      // Create a new message object
      const newMessage: Message = {
        id: Date.now().toString(),
        question: question.trim(),
        complianceSummary: data.complianceSummary,
        customerAnswer: data.customerAnswer,
        timestamp: new Date()
      };

      setCurrentMessage(newMessage);
      setQuestion(''); // Clear the input
    } catch (err: any) {
      console.error('Query error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col fade-in relative">
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

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/clarify-logo-v3.png" alt="Clarify" className="h-32 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onSwitchToAdmin}
              className="text-sm text-gray-500 hover:text-[#B01E2D] transition-colors"
            >
              Admin Panel
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-[#B01E2D] transition-colors"
            >
              Logout
            </button>
            <div className="h-8 w-8 rounded-full bg-[#B01E2D] text-white flex items-center justify-center font-bold text-sm">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Search */}
        <div className="max-w-3xl mx-auto mb-12 text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">Scientific Answers, Simplified.</h1>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="Ask a question about our protocols..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="w-full h-14 pl-6 pr-12 rounded-full border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B01E2D] focus:border-transparent text-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2 top-2 h-10 w-10 bg-[#B01E2D] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {currentMessage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Compliance Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-gray-400">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Compliance Summary</h3>
              </div>
              <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                {currentMessage.complianceSummary}
              </div>
            </div>

            {/* Customer Script */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#B01E2D]">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-[#B01E2D] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Customer Script</h3>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-gray-800 italic whitespace-pre-wrap">
                {currentMessage.customerAnswer}
              </div>
              <button
                onClick={() => copyToClipboard(currentMessage.customerAnswer)}
                className="mt-4 text-sm text-[#B01E2D] font-medium hover:text-red-800 flex items-center transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}

        {!currentMessage && !loading && (
          <div className="text-center text-gray-500 mt-12">
            <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Ask a question to get started</p>
          </div>
        )}
      </main>
    </div>
  );
};
