import { useState } from 'react';
import api from '../api';

export default function PasswordBox() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function update(e) {
    e.preventDefault(); setMessage('');
    try {
      const res = await api.put('/auth/password', { password });
      setMessage(res.data.message); setPassword('');
    } catch (error) { setMessage(error.response?.data?.message || 'Could not update password'); }
  }

  return <form className="small-form" onSubmit={update}>
    <h3>Change Password</h3>
    <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
    <button>Update Password</button>
    {message && <p>{message}</p>}
  </form>;
}
