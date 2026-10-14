/**
 * Google Identity Services (GIS) Authentication Service
 * Uses Google's recommended OAuth 2.0 Token Client for Single-Page Applications.
 * Least privilege scope: drive.file + userinfo (email, profile)
 */

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const USERINFO_PROFILE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile';
const USERINFO_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

const DEFAULT_SCOPES = `${DRIVE_FILE_SCOPE} ${USERINFO_PROFILE_SCOPE} ${USERINFO_EMAIL_SCOPE}`;

const STORAGE_KEYS = {
  CLIENT_ID: 'cloudnotes_google_client_id_override',
  TOKEN_INFO: 'cloudnotes_auth_token_info'
};

// Check env first, then user-configured override
export function getGoogleClientId() {
  const custom = localStorage.getItem(STORAGE_KEYS.CLIENT_ID);
  if (custom && custom.trim()) {
    return custom.trim();
  }
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

export function setGoogleClientId(clientId) {
  if (clientId) {
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.CLIENT_ID);
  }
}

let tokenClientInstance = null;

/**
 * Initializes or retrieves the GIS Token Client
 * @param {Function} onTokenSuccess 
 * @param {Function} onTokenError 
 * @param {string} customPrompt ('', 'consent', or 'select_account')
 */
export function initGoogleTokenClient(onTokenSuccess, onTokenError, customPrompt = '') {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID is not configured. Please supply a valid Client ID.');
  }

  if (typeof window === 'undefined' || !window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error('Google Identity Services script is not loaded yet. Please check your internet connection or ad-blocker.');
  }

  tokenClientInstance = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DEFAULT_SCOPES,
    prompt: customPrompt,
    callback: async (tokenResponse) => {
      if (tokenResponse.error) {
        if (onTokenError) onTokenError(tokenResponse);
        return;
      }
      
      const tokenInfo = {
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type || 'Bearer',
        expiresIn: Number(tokenResponse.expires_in) || 3600,
        expiresAt: Date.now() + (Number(tokenResponse.expires_in) || 3600) * 1000,
        scope: tokenResponse.scope
      };

      try {
        // Fetch user profile
        const user = await fetchGoogleUserProfile(tokenInfo.accessToken);
        if (onTokenSuccess) {
          onTokenSuccess({ tokenInfo, user });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        if (onTokenSuccess) {
          // Still provide basic info if profile fails
          onTokenSuccess({ 
            tokenInfo, 
            user: { name: 'Google User', email: 'connected@google.com', picture: null } 
          });
        }
      }
    }
  });

  return tokenClientInstance;
}

/**
 * Triggers the Google OAuth 2.0 popup dialog
 */
export function requestGoogleAccessToken(prompt = '') {
  if (!tokenClientInstance) {
    throw new Error('Token client not initialized.');
  }
  tokenClientInstance.requestAccessToken({ prompt });
}

/**
 * Fetches user profile from Google's userinfo endpoint
 */
export async function fetchGoogleUserProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to retrieve profile: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    id: data.sub,
    name: data.name || data.given_name || 'Google User',
    email: data.email,
    picture: data.picture,
    isDemo: false
  };
}

/**
 * Revokes access token with Google's revocation endpoint
 */
export function revokeGoogleToken(accessToken, callback) {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      if (callback) callback();
    });
  } else if (callback) {
    callback();
  }
}
