import { API_URL } from './config';
import { getAuthToken, clearAuthSession } from './auth';

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    const path = window.location.pathname;
    const isPrivatePath = path.includes('/PrivateWeb');
    const isLoginPage =
      path.includes('/PrivateWeb/login') || path.includes('/PublicWeb/login');

    if (!isLoginPage) {
      clearAuthSession({ mode: isPrivatePath ? 'private' : 'public' });
      window.location.href = isPrivatePath ? '/PrivateWeb/login' : '/PublicWeb/login';
    }
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response from', url, ':', text.substring(0, 200));
    throw new Error(`Server mengembalikan respons non-JSON (status: ${response.status}). Pastikan backend berjalan dengan benar.`);
  }

  return response;
}
