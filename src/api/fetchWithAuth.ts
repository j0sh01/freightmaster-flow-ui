import { refreshAccessToken } from "./auth";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retry = true) {
  let token = localStorage.getItem("access_token");
  console.log("fetchWithAuth called with:", input);
  console.log("Access token:", token ? "Present" : "Missing");

  const headers = {
    ...(init.headers || {}),
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
  };

  console.log("Request headers:", headers);
  let res = await fetch(input, { ...init, headers });
  console.log("Response status:", res.status);
  console.log("Response headers:", Object.fromEntries(res.headers.entries()));

  if (res.status === 401 && retry) {
    console.log("Got 401, attempting token refresh...");
    try {
      token = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Token refreshed, retrying request...");
      res = await fetch(input, { ...init, headers });
      console.log("Retry response status:", res.status);
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth";
      throw new Error("Session expired. Please log in again.");
    }
  }

  // Check if response is HTML (likely an error page)
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    console.error("Received HTML response instead of JSON");
    const text = await res.text();
    console.error("HTML content:", text.substring(0, 500));
    throw new Error("Server returned HTML instead of JSON. Check server status and authentication.");
  }

  return res;
}