const API = "http://localhost:5000/api";

export const getAuthUrl = async () => {
  const res = await fetch(`${API}/login`, { credentials: "include" });
  return await res.json();
};

export const getUser = async () => {
  const res = await fetch(`${API}/user`, { credentials: "include" });
  return await res.json();
};

export const logout = async () => {
  const res = await fetch(`${API}/logout`, { credentials: "include" });
  return await res.json();
};
