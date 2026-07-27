import axios from "axios";
import { baseUrl, primaryUrl, secondaryUrl } from "./baseUrl";

const deliveryApi = axios.create({
    baseURL: baseUrl,
});

deliveryApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("delivery_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

deliveryApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        
        // Multi-Cloud Failover logic
        if (
            config &&
            !config._retry &&
            import.meta.env.PROD &&
            (!error.response || error.response.status >= 500)
        ) {
            config._retry = true;
            const currentBase = config.baseURL || baseUrl;
            const newBase = currentBase === primaryUrl ? secondaryUrl : primaryUrl;
            console.warn(`[Multi-Cloud Failover] Switching backend from ${currentBase} to ${newBase}`);
            config.baseURL = newBase;
            return axios(config);
        }

        // Original auth error handling
        const isLoginRequest = error.config?.url?.includes("/delivery/login");
        if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginRequest) {
            localStorage.removeItem("delivery_token");
            localStorage.removeItem("delivery_partner");
            if (!window.location.pathname.includes("/delivery/login")) {
                window.location.href = "/delivery/login";
            }
        }
        return Promise.reject(error);
    }
);

export default deliveryApi;
