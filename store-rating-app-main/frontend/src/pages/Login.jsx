import { useState } from 'react';
import api from '../api';

export default function Login({ onLogin, onSignup }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setError('');try{const res=await api.post('/auth/login',{email,password});onLogin(res.data);}catch(err){setError(err.response?.data?.message||'Login failed');}}
  return <main className="auth"><form className="card" onSubmit={submit}><h1>Login</h1><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button>Login</button>{error&&<p className="error">{error}</p>}<p>New user? <button type="button" className="link" onClick={onSignup}>Create account</button></p></form></main>;
}
