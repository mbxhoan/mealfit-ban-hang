/**
 * Google Drive integration service for MealPrep Sale Management App
 */

export interface DriveUserInfo {
  name: string;
  email: string;
  picture?: string;
}

// In-memory token storage according to guidelines
let _accessToken: string | null = null;
let _userInfo: DriveUserInfo | null = null;

// Developers can also paste a manual token in case of sandbox limitations
const MANUAL_TOKEN_KEY = "mealprep_manual_drive_token";

export const getSavedManualToken = (): string => {
  return localStorage.getItem(MANUAL_TOKEN_KEY) || "";
};

export const saveManualToken = (token: string) => {
  if (token) {
    localStorage.setItem(MANUAL_TOKEN_KEY, token);
    _accessToken = token;
  } else {
    localStorage.removeItem(MANUAL_TOKEN_KEY);
    _accessToken = null;
  }
};

export const getAccessToken = (): string | null => {
  return _accessToken || getSavedManualToken() || null;
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const initiateGoogleLoginDirectly = async (callbackUrl: string) => {
  // Simple oauth redirect URI
  const client_id = "9812fe67-c2d6-4c0d-956d-8d9be067e19f"; // Default container client ID or general
  const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
  
  // Construct auth url 
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${client_id}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(scope)}` +
    `&prompt=consent`;
    
  // Since we are in iframe, advise a redirect or manual token or login in new window
  window.open(authUrl, "_blank");
};

export const fetchUserInfo = async (token: string): Promise<DriveUserInfo | null> => {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      _userInfo = {
        name: data.name,
        email: data.email,
        picture: data.picture
      };
      return _userInfo;
    }
  } catch (err) {
    console.error("Error fetching google user info", err);
  }
  return null;
};

/**
 * Upload an Invoice as HTML file to Google Drive
 */
export const uploadInvoiceToDrive = async (
  fileName: string,
  htmlContent: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> => {
  const token = getAccessToken();
  if (!token) {
    return { success: false, error: "Chưa đăng nhập Google Drive hoặc chưa nhập Access Token!" };
  }

  try {
    const metadata = {
      name: fileName,
      mimeType: "text/html"
    };

    const boundary = "boundary_mealprep_invoice";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
      htmlContent +
      closeDelimiter;

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: body
      }
    );

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        fileUrl: `https://drive.google.com/file/d/${result.id}/view`
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData?.error?.message || `Lỗi tải lên (${response.status})`
      };
    }
  } catch (err: any) {
    console.error("Drive upload exception:", err);
    return { success: false, error: err?.message || "Lỗi mạng khi tải lên Drive" };
  }
};
