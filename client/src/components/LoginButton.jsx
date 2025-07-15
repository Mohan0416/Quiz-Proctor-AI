import { useEffect, useState } from "react";
import { getAuthUrl, getUser, logout } from "../services/api";

export function LoginButton({ onLogin }) {
  const [user, setUser] = useState(null);

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
    });
  }, []);

  return user ? (
    <div className="flex gap-4 items-center">
      <span className="text-green-600 font-medium">Hi, {user.email}</span>
      <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
    </div>
  ) : (
    <button onClick={handleLogin} className="text-blue-500 font-medium">Login with Google</button>
  );
}
