// AWS App Runner Endpoint
export const primaryUrl = "https://np3h62zxpk.ap-south-1.awsapprunner.com/api";

// Azure Container Apps Endpoint
export const secondaryUrl = "https://grocery-backend.orangeocean-49a17dda.centralindia.azurecontainerapps.io/api";

// Fallback to local if in dev, otherwise use primary
const fallbackBaseUrl = "http://localhost:5000/api";
export const baseUrl = import.meta.env.VITE_BASE_URL?.trim() || (import.meta.env.PROD ? primaryUrl : fallbackBaseUrl);
