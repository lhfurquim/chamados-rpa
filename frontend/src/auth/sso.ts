import { PublicClientApplication, type Configuration, LogLevel } from "@azure/msal-browser";

const validateEnvironmentVariables = () => {
    const clientId = import.meta.env.VITE_AAD_CLIENT_ID;
    const tenantId = import.meta.env.VITE_AAD_TENANT_ID;
    
    if (!clientId) {
        throw new Error('VITE_AAD_CLIENT_ID environment variable is required for Azure AD authentication');
    }
    
    if (!tenantId) {
        throw new Error('VITE_AAD_TENANT_ID environment variable is required for Azure AD authentication');
    }
    
    return { clientId, tenantId };
};

const { clientId, tenantId } = validateEnvironmentVariables();

export const msalConfig: Configuration = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: import.meta.env.VITE_AAD_REDIRECT_URI || window.location.origin,
        postLogoutRedirectUri: import.meta.env.VITE_AAD_POST_LOGOUT_REDIRECT_URI || window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string) => {
                if (import.meta.env.DEV) {
                    console.log(`[MSAL ${level}] ${message}`);
                }
            },
            logLevel: import.meta.env.DEV ? LogLevel.Verbose : LogLevel.Error,
            piiLoggingEnabled: false,
        }
    }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"],
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

msalInstance.initialize();