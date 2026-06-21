import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

// Inject JWT token from localStorage into every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors globally.
// IMPORTANT: do NOT hard-redirect here. A blanket `window.location` redirect on
// any 401 races with normal navigation (e.g. right after social/phone login the
// page reloads on "/", a background request like GET /favorites may briefly 401,
// and this would wipe auth + force a redirect -> blank page). Route guards
// (ProtectedRoute) are responsible for sending unauthenticated users to /login.
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
