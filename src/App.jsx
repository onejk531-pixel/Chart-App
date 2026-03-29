import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
export default function App(){ return (<BrowserRouter>
  <nav style={{padding:12, background:'#111', color:'#fff'}}><Link to='/' style={{marginRight:12}}>Home</Link><Link to='/login' style={{marginRight:12}}>Login</Link><Link to='/dashboard'>Dashboard</Link></nav>
  <Routes><Route path='/' element={<Home/>} /><Route path='/login' element={<Login/>} /><Route path='/dashboard' element={<Dashboard/>} /></Routes>
</BrowserRouter>); }
