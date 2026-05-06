import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 60000,
});

let isRedirecting = false;

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth');

    // Mark expected auth errors so they don't spam console
    if (status === 401 && isAuthEndpoint) {
      error.isExpectedAuthError = true;
    }

    // Only redirect to login if:
    // 1. Status is 401
    // 2. It's NOT an auth endpoint (not initial /auth/me check)
    // 3. It's NOT already redirecting (prevent multiple redirects)
    // 4. We're not already on the login page
    if (
      status === 401 &&
      !isAuthEndpoint &&
      !isRedirecting &&
      window.location.pathname !== '/login'
    ) {
      isRedirecting = true;
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
