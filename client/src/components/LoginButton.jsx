import { useEffect, useState } from "react";
import { getAuthUrl, getUser, logout } from "../services/api";

export function LoginButton({ onLogin }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = async () => {
    const { auth_url } = await getAuthUrl();
    window.location.href = auth_url;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    window.location.href = "/"; // redirect to login
  };

  useEffect(() => {
    getUser().then(res => {
      setUser(res.user);
      if (res.user && onLogin) onLogin(res.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">Welcome back!</span>
          <span className="text-xs text-gray-600 truncate max-w-48">{user.email}</span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <button
      onClick={handleLogin}
      className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <svg
        className="w-5 h-5 mr-3"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span className="relative">Continue with Google</span>
      <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
    </button>
  );
}