import React, {useEffect, useState} from 'react';
import axios from 'axios';
export default function Dashboard(){
  const [charts,setCharts]=useState([]);
  useEffect(()=>{ async function load(){ try{ const token=localStorage.getItem('token'); const res=await axios.get('/api/charts/list',{ headers:{ Authorization: token? 'Bearer '+token: '' } }); setCharts(res.data); }catch(e){ console.error(e); }} load(); },[]);
  return (<div style={{padding:20}}><h2>Your Charts</h2>{charts.length===0? <p>No charts yet</p> : charts.map(c=> <div key={c._id}>{c.fileName}</div>)}</div>);
}
