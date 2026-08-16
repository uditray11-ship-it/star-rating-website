import { useState } from 'react';
import api from '../api';

export default function Signup({onBack}){
  const [form,setForm]=useState({name:'',email:'',address:'',password:''}); const [message,setMessage]=useState('');
  function change(e){setForm({...form,[e.target.name]:e.target.value});}
  async function submit(e){e.preventDefault();setMessage('');try{const res=await api.post('/auth/signup',form);setMessage(res.data.message);setForm({name:'',email:'',address:'',password:''});}catch(err){setMessage(err.response?.data?.message||'Registration failed');}}
  return <main className="auth"><form className="card" onSubmit={submit}><h1>Sign Up</h1><input name="name" placeholder="Name (20-60 characters)" value={form.name} onChange={change} required/><input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required/><textarea name="address" placeholder="Address" value={form.address} onChange={change} maxLength="400" required/><input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required/><small>8-16 chars, one uppercase and one special character.</small><button>Create Account</button>{message&&<p>{message}</p>}<button type="button" className="link" onClick={onBack}>Back to Login</button></form></main>;
}
