export function useAuth() {
  const isAuthenticated = () => {
    try { return !!localStorage.getItem('orm_session') } catch { return false }
  }

  const login = (email) => {
    localStorage.setItem('orm_session', JSON.stringify({
      email,
      tenant: 'YPF Demo S.A.',
      loginAt: Date.now(),
    }))
  }

  const logout = () => {
    try { localStorage.removeItem('orm_session') } catch {}
  }

  const getSession = () => {
    try {
      const raw = localStorage.getItem('orm_session')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  return { isAuthenticated, login, logout, getSession }
}
