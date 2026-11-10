// Fetch helper for /api/admin. The login cookie is httpOnly, so the browser sends it on its own.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body, isForm = false) {
  let res;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      credentials: 'same-origin',
      headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw Object.assign(new Error('Cannot reach the server. Check your connection.'), { network: true });
  }
  const data = await res.json().catch(() => null);
  if (res.status === 401 && path !== '/auth/login') onUnauthorized();
  if (!res.ok) {
    throw Object.assign(new Error(data?.message || 'Something went wrong. Please try again.'), { status: res.status, fields: data?.fields });
  }
  return data;
}

export const adm = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b || {}),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
  postForm: (p, f) => request('POST', p, f, true),
};
