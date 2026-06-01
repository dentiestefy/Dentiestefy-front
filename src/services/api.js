const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('token');
    
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            // Optional: trigger logout if unauthorized
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.dispatchEvent(new Event('unauthorized'));
        }
        throw new Error(data.message || 'Error en la petición al servidor');
    }

    return data;
}

export const api = {
    get: (url) => fetchWithAuth(url),
    post: (url, body) => fetchWithAuth(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (url, body) => fetchWithAuth(url, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
    patch: (url, body) => fetchWithAuth(url, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
    delete: (url) => fetchWithAuth(url, { method: 'DELETE' }),
};
