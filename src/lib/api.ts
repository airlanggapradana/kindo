import { auth } from './firebase';

export async function authorizedFetch(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Silakan masuk kembali untuk menggunakan fitur ini.');
  const token = await user.getIdToken();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(path, { ...options, headers });
}
