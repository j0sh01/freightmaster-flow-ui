import React from "react";

const FRAPPE_OAUTH_AUTHORIZE_URL = import.meta.env.VITE_FRAPPE_OAUTH_AUTHORIZE_URL;
const CLIENT_ID = import.meta.env.VITE_FRAPPE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_FRAPPE_REDIRECT_URI;
const SCOPE = import.meta.env.VITE_FRAPPE_SCOPE || "openid all";
const STATE = Math.random().toString(36).substring(2, 15); // For CSRF protection

function generateRandomString(length: number) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

function base64URLEncode(str: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest('SHA-256', data);
}

export default function Auth() {
  const handleLogin = async () => {
    const code_verifier = generateRandomString(128);
    localStorage.setItem('pkce_code_verifier', code_verifier);
    localStorage.setItem('oauth_state', STATE);
    const hashed = await sha256(code_verifier);
    const code_challenge = base64URLEncode(hashed);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state: STATE,
      code_challenge: code_challenge,
      code_challenge_method: "S256",
    });
    window.location.href = `${FRAPPE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">FreightMaster Login</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition"
      >
        Login with Frappe
      </button>
    </div>
  );
} 