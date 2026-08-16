import { useEffect,useState } from 'react';
import api from '../api';
import Header from '../components/Header';
import PasswordBox from '../components/PasswordBox';

export default function UserDashboard({user,onLogout}){
 const [stores,setStores]=useState([]);const [search,setSearch]=useState('');const [sort,setSort]=useState('name');const [order,setOrder]=useState('asc');const [ratings,setRatings]=useState({});const [msg,setMsg]=useState('');
 async function load(){try{const res=await api.get('/user/stores',{params:{search,sortBy:sort,order}});setStores(res.data);}catch(e){setMsg(e.response?.data?.message||'Could not load stores');}}
 useEffect(()=>{load()},[search,sort,order]);
 async function rate(id,modify=false){const value=Number(ratings[id]);if(!value)return setMsg('Choose a rating first');try{const res=modify?await api.put(`/user/rating/${id}`,{rating:value}):await api.post('/user/rating',{storeId:id,rating:value});setMsg(res.data.message);load();}catch(e){setMsg(e.response?.data?.message||'Rating failed');}}
 return <><Header user={user} onLogout={onLogout}/><main className="page"><h1>User Dashboard</h1><div className="toolbar"><input placeholder="Search store name or address" value={search} onChange={e=>setSearch(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Name</option><option value="address">Address</option><option value="rating">Rating</option></select><button onClick={()=>setOrder(order==='asc'?'desc':'asc')}>Sort {order==='asc'?'↑':'↓'}</button></div>{msg&&<p>{msg}</p>}<div className="grid">{stores.map(s=><div className="card" key={s.id}><h3>{s.name}</h3><p>{s.address}</p><p>Overall: ⭐ {s.average_rating}</p><p>My rating: {s.my_rating??'Not rated'}</p><select value={ratings[s.id]||s.my_rating||''} onChange={e=>setRatings({...ratings,[s.id]:e.target.value})}><option value="">Choose rating</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select>{s.my_rating?<button onClick={()=>rate(s.id,true)}>Modify Rating</button>:<button onClick={()=>rate(s.id,false)}>Submit Rating</button>}</div>)}</div><PasswordBox/></main></>;
}
