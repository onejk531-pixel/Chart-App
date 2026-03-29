import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const nav=useNavigate();
  const handle=async()=>{ try{ const res=await axios.post('/api/auth/login',{email,password}); localStorage.setItem('token', res.data.token); nav('/dashboard'); }catch(e){ alert('Login failed'); }}
  return (<div style={{padding:20,maxWidth:400}}><h2>Login</h2><input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',marginBottom:8}} /><input placeholder='password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',marginBottom:8}} /><button onClick={handle}>Login</button></div>);
}
