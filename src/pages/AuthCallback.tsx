import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FRAPPE_OAUTH_TOKEN_URL = import.meta.env.VITE_FRAPPE_OAUTH_TOKEN_URL;
const CLIENT_ID = import.meta.env.VITE_FRAPPE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_FRAPPE_REDIRECT_URI;

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const storedState = localStorage.getItem("oauth_state");
    if (!code) {
      setError("No code found in callback URL.");
      setLoading(false);
      return;
    }
    if (state !== storedState) {
      setError("Invalid state parameter. Possible CSRF detected.");
      setLoading(false);
      return;
    }
    const code_verifier = localStorage.getItem("pkce_code_verifier");
    if (!code_verifier) {
      setError("No PKCE code verifier found. Please try logging in again.");
      setLoading(false);
      return;
    }
    // Exchange code for token
    const fetchToken = async () => {
      try {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier,
        });
        const response = await fetch(FRAPPE_OAUTH_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("id_token", data.id_token || "");
          navigate("/dashboard");
        } else {
          setError(data.error_description || "Failed to obtain access token.");
        }
      } catch (err) {
        setError("Error exchanging code for token.");
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Processing login...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }
  return null;
} 