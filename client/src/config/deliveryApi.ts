import axios from "axios";

const deliveryApi = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000/api",
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
    (error) => {
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
