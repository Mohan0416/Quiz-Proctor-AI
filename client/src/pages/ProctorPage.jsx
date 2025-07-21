import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProctorPage() {
  const { quizId } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '', class: '', year: '' });
  const [showPrompt, setShowPrompt] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((count) => count + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!showPrompt) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
        });
    }
  }, [showPrompt]);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleBeginTest = () => {
    const { name, email, class: cls, year } = formData;
    if (!name || !email || !cls || !year) {
      alert("Please fill all fields.");
      return;
    }
    setShowPrompt(false);
    enterFullscreen();
  };

  const handleEndTest = async () => {
    try {
      await fetch('http://localhost:5000/api/form/submit-proctor-data', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tabSwitchCount, quizId }),
      });
    } catch (err) {
      console.error("Failed to submit proctoring data:", err);
    }
    navigate('/thank-you');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            {/* Header with icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Start Your Test</h2>
              <p className="text-gray-600 text-sm">Please provide your details to begin the proctored examination</p>
            </div>
            
            <div className="space-y-5">
              {[
                { field: 'name', label: 'Full Name', icon: '👤' },
                { field: 'email', label: 'Email Address', icon: '📧' },
                { field: 'class', label: 'Class/Grade', icon: '🎓' },
                { field: 'year', label: 'Academic Year', icon: '📅' }
              ].map(({ field, label, icon }) => (
                <div key={field} className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <span>{icon}</span>
                    {label}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                  />
                </div>
              ))}
              
              <button
                onClick={handleBeginTest}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200 mt-6"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Begin Proctored Test
                </span>
              </button>
            </div>
            
            {/* Security notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Proctoring Notice</h4>
                  <p className="text-xs text-amber-700">This test is monitored. Your webcam will be active and tab switches will be tracked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showPrompt && (
        <>
          {/* Enhanced End Test Button */}
          <button
            onClick={handleEndTest}
            className="fixed top-6 right-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center gap-2 font-semibold group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Test
          </button>

          {/* Enhanced Webcam Display */}
          <div className="fixed top-6 left-6 z-50 group">
            <div className="bg-white rounded-2xl p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  className="w-40 h-32 rounded-xl border-2 border-gray-100 object-cover" 
                />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs font-semibold text-gray-700">Camera Active</p>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Switch Counter */}
          <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-gray-200 z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Tab Switches</p>
                <p className="text-2xl font-bold text-gray-800">{tabSwitchCount}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Quiz Container */}
          <div className="w-full max-w-6xl mx-auto mt-4 px-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Proctored Assessment
                  </h1>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Session Active</span>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <iframe
                  src={`https://docs.google.com/forms/d/${quizId}/viewform?embedded=true`}
                  width="100%"
                  height="800px"
                  frameBorder="0"
                  title="Google Form"
                  className="w-full rounded-2xl"
                >
                  <div className="flex items-center justify-center h-96 bg-gray-50 rounded-2xl">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading assessment...</p>
                    </div>
                  </div>
                </iframe>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}