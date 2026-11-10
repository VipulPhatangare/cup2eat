const BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, options);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw Object.assign(new Error('Cannot reach the server. Please check your connection.'), { network: true });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(new Error(data?.message || 'Something went wrong. Please try again.'), {
      status: res.status,
      fields: data?.fields,
    });
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  postForm: (path, form) => request(path, { method: 'POST', body: form }),
};
