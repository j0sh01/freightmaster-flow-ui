export async function refreshAccessToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) throw new Error("No refresh token available");

  const FRAPPE_OAUTH_TOKEN_URL = import.meta.env.VITE_FRAPPE_OAUTH_TOKEN_URL;
  const CLIENT_ID = import.meta.env.VITE_FRAPPE_CLIENT_ID;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
    client_id: CLIENT_ID,
  });

  const response = await fetch(FRAPPE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    if (data.id_token) localStorage.setItem("id_token", data.id_token);
    return data.access_token;
  } else {
    throw new Error(data.error_description || "Failed to refresh access token");
  }
} 