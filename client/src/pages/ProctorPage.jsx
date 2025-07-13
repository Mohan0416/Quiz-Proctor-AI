import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProctorPage() {
  const [email, setEmail] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Detect tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((count) => count + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Start webcam feed
  useEffect(() => {
    if (!showPrompt) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
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

  // Enter Fullscreen Mode
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleBeginTest = () => {
    if (!email) {
      alert("Please enter your email to begin.");
      return;
    }
    setShowPrompt(false);
    enterFullscreen();
  };

  const handleEndTest = () => {
    // optionally: send tabSwitchCount + email to backend here
    navigate('/thank-you');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      
      {/* 🔐 Email Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Enter Your Email to Begin</h2>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded-md mb-4"
            />
            <button
              onClick={handleBeginTest}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Begin Test
            </button>
          </div>
        </div>
      )}

      {/* 🔚 End Test Button */}
      {!showPrompt && (
        <button
          onClick={handleEndTest}
          className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow hover:bg-red-700 z-40"
        >
          End Test
        </button>
      )}

      {/* 📷 Webcam Feed */}
      {!showPrompt && (
        <div className="absolute top-4 left-4 z-40">
          <video ref={videoRef} autoPlay muted className="w-32 h-24 rounded-md border shadow-lg" />
          <p className="text-sm mt-1 text-center text-gray-600">Webcam Active</p>
        </div>
      )}

      {/* 🔄 Tab Switch Counter */}
      {!showPrompt && (
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-md shadow z-40">
          <p className="text-sm text-gray-700">Tab switches: {tabSwitchCount}</p>
        </div>
      )}

      {/* 🧾 Google Form Embed */}
      {!showPrompt && (
        <div className="w-full h-[90vh]">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdXXXXXXXXXXXXXXXXXXX/viewform?embedded=true"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Google Form"
            className="rounded-lg shadow-xl"
          >
            Loading…
          </iframe>
        </div>
      )}
    </div>
  );
}
