const BASE_URL = '/api'; // Or process.env.NEXT_PUBLIC_API_URL

// Generic request function
async function request<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const { headers, ...rest } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    // You can add Authorization headers here if not using cookies
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  });

  // Centralized Error Handling
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `API Error: ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

// Export specific methods for cleaner usage
export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: any) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};