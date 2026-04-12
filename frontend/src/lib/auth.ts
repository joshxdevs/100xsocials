export interface AuthUser {
  id: string;
  email: string;
  role: 'MEMBER' | 'RECRUITER' | 'ADMIN';
  category?: 'SUPER30' | 'SCHOOL' | null;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getUserFromToken(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.id || !payload?.email || !payload?.role) return null;
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      category: payload.category ?? null,
    };
  } catch {
    return null;
  }
}

export function setSession(token: string): void {
  localStorage.setItem('token', token);
}

export function clearSession(): void {
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
