// src/utils/auth.ts
export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const storedAuth = localStorage.getItem('auth');
  const accessToken = localStorage.getItem('accessToken');
  
  if (!storedAuth || !accessToken) return false;
  
  try {
    const authState = JSON.parse(storedAuth);
    if (authState.isAuthenticated && authState.tokens?.access?.token === accessToken) {
      return true;
    }
  } catch (e) {
    console.error('Failed to parse auth state', e);
  }
  
  return false;
};