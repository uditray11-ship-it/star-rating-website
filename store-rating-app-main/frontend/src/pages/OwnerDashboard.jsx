import {useEffect,useState} from 'react';
import api from '../api';
import Header from '../components/Header';
import PasswordBox from '../components/PasswordBox';

export default function OwnerDashboard({user,onLogout}){const [data,setData]=useState({store:null,averageRating:0,ratings:[]});const [error,setError]=useState('');useEffect(()=>{api.get('/owner/dashboard').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Could not load dashboard'));},[]);return <><Header user={user} onLogout={onLogout}/><main className="page"><h1>Store Owner Dashboard</h1>{error&&<p>{error}</p>}{data.store?<><div className="stats"><div><b>Store</b><strong>{data.store.name}</strong></div><div><b>Average Rating</b><strong>⭐ {data.averageRating}</strong></div><div><b>Total Ratings</b><strong>{data.ratings.length}</strong></div></div><div className="card"><h2>Users Who Rated My Store</h2><table><thead><tr><th>Name</th><th>Email</th><th>Rating</th></tr></thead><tbody>{data.ratings.map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.email}</td><td>⭐ {r.rating}</td></tr>)}</tbody></table></div></>:<p>No store assigned.</p>}<PasswordBox/></main></>}
