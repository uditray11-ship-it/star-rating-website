import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  const [page, setPage] = useState(localStorage.getItem('token') ? 'dashboard' : 'login');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  function login(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setPage('dashboard');
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setPage('login');
  }

  if (page === 'signup') return <Signup onBack={() => setPage('login')} />;
  if (page === 'login') return <Login onLogin={login} onSignup={() => setPage('signup')} />;

  if (!user) return <Login onLogin={login} onSignup={() => setPage('signup')} />;
  if (user.role === 'ADMIN') return <AdminDashboard user={user} onLogout={logout} />;
  if (user.role === 'OWNER') return <OwnerDashboard user={user} onLogout={logout} />;
  return <UserDashboard user={user} onLogout={logout} />;
}
