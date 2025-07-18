import { refreshAccessToken } from "./auth";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retry = true) {
  let token = localStorage.getItem("access_token");
  const headers = {
    ...(init.headers || {}),
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
  };

  let res = await fetch(input, { ...init, headers });
  if (res.status === 401 && retry) {
    try {
      token = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(input, { ...init, headers });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth";
      throw new Error("Session expired. Please log in again.");
    }
  }
  return res;
} 