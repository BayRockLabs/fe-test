// Define environment variables
const { REACT_APP_SERVER_URL, REACT_APP_CLIENT_ID, REACT_APP_AUTHORITY_URL } =
  process.env;

// Validate environment variables
if (!REACT_APP_SERVER_URL) {
  throw new Error(
    "REACT_APP_SERVER_URL is not defined in environment variables."
  );
}

console.log("client id", REACT_APP_CLIENT_ID);

export const msalConfig = {
  auth: {
    clientId: REACT_APP_CLIENT_ID,
    authority: REACT_APP_AUTHORITY_URL, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read"],
  redirectUri: `${REACT_APP_SERVER_URL}dashboard`,
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
