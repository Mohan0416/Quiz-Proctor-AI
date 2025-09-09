import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProctorPage() {
  const { quizId } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '', class: '', year: '' });
  const [showPrompt, setShowPrompt] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [mediaPermissions, setMediaPermissions] = useState({ camera: false, microphone: false });
  const [mediaStream, setMediaStream] = useState(null);
  const [permissionError, setPermissionError] = useState('');
  const [cameraMissing, setCameraMissing] = useState(false);
  
  // Create separate refs for each video element
  const previewVideoRef = useRef(null);
  const floatingVideoRef = useRef(null);
  
  const navigate = useNavigate();

  // Helper function to set stream for both video elements
  const setVideoStream = useCallback((stream) => {
    // Set original stream for preview video (in form)
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = stream;
      previewVideoRef.current.onloadedmetadata = () => {
        previewVideoRef.current.play().catch(console.error);
      };
    }
    
    // Clone stream for floating video (during test)
    if (floatingVideoRef.current) {
      // Create a new stream with cloned tracks
      const clonedStream = new MediaStream();
      stream.getTracks().forEach(track => {
        clonedStream.addTrack(track.clone());
      });
      
      floatingVideoRef.current.srcObject = clonedStream;
      floatingVideoRef.current.onloadedmetadata = () => {
        floatingVideoRef.current.play().catch(console.error);
      };
    }
  }, []);

  // Function to request camera/mic permissions (for Try Again button too)
  const requestMediaPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      });
      
      setMediaStream(stream);
      setMediaPermissions({ camera: true, microphone: true });
      setPermissionError('');
      setCameraMissing(false);
      
      // Wait a bit for video elements to be ready
      setTimeout(() => {
        setVideoStream(stream);
      }, 100);
      
    } catch (err) {
      let errorMessage = '';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow permissions and refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect your devices and refresh the page.';
        setCameraMissing(true);
      } else {
        errorMessage = 'Unable to access camera and microphone. Please check your browser settings.';
      }
      setPermissionError(errorMessage);
      setMediaPermissions({ camera: false, microphone: false });
      setMediaStream(null);
    }
  }, [setVideoStream]);

  // On mount, get permissions
  useEffect(() => {
    requestMediaPermissions();
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line
  }, []);

  // Update video elements when stream changes
  useEffect(() => {
    if (mediaStream) {
      setVideoStream(mediaStream);
    }
  }, [mediaStream, setVideoStream]);

  // Tab switch counting
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setTabSwitchCount((count) => count + 1);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fullscreen handler for entering test
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  // Begin test: check all required, then set state and enter full
  const handleBeginTest = () => {
    const { name, email, class: cls, year } = formData;
    if (!name || !email || !cls || !year) {
      alert("Please fill all fields.");
      return;
    }
    if (!mediaPermissions.camera || !mediaPermissions.microphone) {
      alert("Camera and microphone access are required to start the test. Please allow permissions and refresh the page.");
      return;
    }
    
    // Clear the preview video before switching
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    
    setShowPrompt(false);
    
    // Set stream to floating video after state change
    setTimeout(() => {
      if (mediaStream && floatingVideoRef.current) {
        floatingVideoRef.current.srcObject = mediaStream;
        floatingVideoRef.current.onloadedmetadata = () => {
          floatingVideoRef.current.play().catch(console.error);
        };
      }
    }, 100);
    
    enterFullscreen();
  };

  // End test (used for submit or camera missing)
  const handleEndTest = async () => {
    try {
      await fetch('https://quiz-proctor-ai.onrender.com/api/submit-proctor-data', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tabSwitchCount, quizId }),
      });
    } catch (err) {
      // Just log
    }
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    navigate('/thank-you');
  };

  // ======= Camera disconnect/monitor logic =======
  useEffect(() => {
    if (!mediaStream) return;

    const videoTracks = mediaStream.getVideoTracks();
    const onCameraChange = () => {
      // Camera turned off/disconnected or blocked
      if (videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        setPermissionError('Camera disconnected or turned off. Please enable your camera to continue the test.');
        setMediaPermissions(prev => ({ ...prev, camera: false }));
      } else {
        setPermissionError('');
        setMediaPermissions(prev => ({ ...prev, camera: true }));
      }
    };
    // Listen for track ended/mute events
    videoTracks.forEach(track => {
      track.addEventListener('ended', onCameraChange);
      track.addEventListener('mute', onCameraChange);
      track.addEventListener('unmute', onCameraChange);
    });
    return () => {
      videoTracks.forEach(track => {
        track.removeEventListener('ended', onCameraChange);
        track.removeEventListener('mute', onCameraChange);
        track.removeEventListener('unmute', onCameraChange);
      });
    };
  }, [mediaStream]);

  // If during exam, camera is lost, enforce modal and (optionally) end exam after a timeout
  useEffect(() => {
    if (!showPrompt && permissionError) {
      // Auto-end after 60 seconds of no camera (optional, comment out if not wanted)
      const timer = setTimeout(() => {
        handleEndTest();
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [permissionError, showPrompt]);

  // ========= UI ==========
  // Permission modal, always blocks if error.
  const PermissionErrorModal = (
    permissionError && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Camera Required</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{permissionError}</p>
          <div className="space-y-3">
            <button
              onClick={requestMediaPermissions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Try to Reconnect Camera
            </button>
            <button
              onClick={handleEndTest}
              className="w-full text-red-600 hover:text-red-700 font-medium"
            >
              End Test
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {PermissionErrorModal}

      {showPrompt && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Proctored Assessment</h1>
                  <p className="text-blue-100">Secure examination environment</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Left Column - Form */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Information</h2>
                    <p className="text-gray-600">Please provide your details to begin the examination</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { field: 'name', label: 'Full Name', icon: '👤', type: 'text' },
                      { field: 'email', label: 'Email Address', icon: '📧', type: 'email' },
                      { field: 'class', label: 'Class/Grade', icon: '🎓', type: 'text' },
                      { field: 'year', label: 'Academic Year', icon: '📅', type: 'text' }
                    ].map(({ field, label, icon, type }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-2">
                            <span>{icon}</span>
                            {label}
                          </span>
                        </label>
                        <input
                          type={type}
                          placeholder={`Enter your ${label.toLowerCase()}`}
                          value={formData[field]}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleBeginTest}
                    disabled={!mediaPermissions.camera || !mediaPermissions.microphone}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      mediaPermissions.camera && mediaPermissions.microphone
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {mediaPermissions.camera && mediaPermissions.microphone ? 'Begin Proctored Test' : 'Waiting for Permissions'}
                  </button>
                </div>

                {/* Right Column - Camera & Status */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    
                    {/* Permission Status */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${mediaPermissions.camera ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">Camera</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          mediaPermissions.camera ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mediaPermissions.camera ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${mediaPermissions.microphone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">Microphone</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          mediaPermissions.microphone ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mediaPermissions.microphone ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>

                    {/* Camera Preview */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Camera Preview</h4>
                      {mediaPermissions.camera && mediaStream ? (
                        <div className="relative">
                          <video 
                            ref={previewVideoRef}
                            autoPlay 
                            playsInline
                            muted 
                            className="w-full h-48 bg-black rounded-lg object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                          <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-500">Camera not available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <div>
                          <h4 className="text-sm font-semibold text-amber-800">Proctoring Notice</h4>
                          <p className="text-sm text-amber-700 mt-1">This test is monitored. Your webcam and microphone will be active throughout the examination.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showPrompt && (
        <div className="min-h-screen bg-white">
          {/* Top Navigation Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Proctored Assessment</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Session Active</span>
              </div>
              <button
                onClick={handleEndTest}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Test
              </button>
            </div>
          </div>

          {/* Floating Camera */}
          <div className="fixed top-24 left-6 z-20">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
              <div className="relative">
                <video 
                  ref={floatingVideoRef}
                  autoPlay 
                  playsInline
                  muted 
                  className="w-48 h-32 bg-black rounded-lg object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 font-medium">Camera Active</span>
              </div>
            </div>
          </div>

          {/* Floating Tab Counter */}
          <div className="fixed bottom-6 left-6 z-20">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Tab Switches</p>
                  <p className="text-lg font-bold text-gray-900">{tabSwitchCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-6 pb-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <iframe
                  src={`https://docs.google.com/forms/d/${quizId}/viewform?embedded=true`}
                  width="100%"
                  height="700"
                  frameBorder="0"
                  title="Google Form"
                  className="w-full"
                >
                  <div className="flex items-center justify-center h-96 bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading assessment...</p>
                    </div>
                  </div>
                </iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}