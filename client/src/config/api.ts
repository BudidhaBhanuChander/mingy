import axios from "axios";
import { baseUrl, primaryUrl, secondaryUrl } from "./baseUrl";

const api = axios.create({
    baseURL: baseUrl,
});

// Inject JWT token from localStorage into every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Implement Client-Side Multi-Cloud Load Balancing (Failover)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        
        // If the request fails due to network error or 5xx server error, and we haven't retried yet
        if (
            config &&
            !config._retry &&
            import.meta.env.PROD && // Only failover in production
            (!error.response || error.response.status >= 500)
        ) {
            config._retry = true;
            
            // Switch to the secondary URL if we were using the primary, or vice-versa
            const currentBase = config.baseURL || baseUrl;
            const newBase = currentBase === primaryUrl ? secondaryUrl : primaryUrl;
            
            console.warn(`[Multi-Cloud Failover] Switching backend from ${currentBase} to ${newBase}`);
            
            // Update the request config with the new base URL
            config.baseURL = newBase;
            
            // Retry the request
            return axios(config);
        }
        
        return Promise.reject(error);
    }
);

export default api;
