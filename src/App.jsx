import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { FiBarChart2, FiHome, FiLogIn, FiUserPlus, FiGrid, FiUpload, FiLogOut } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FiBarChart2 size={24} />
        <span>ChartAI</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}><FiHome size={16} /> Home</Link>
        {token ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}><FiGrid size={16} /> Dashboard</Link>
            <Link to="/upload" className={isActive('/upload')}><FiUpload size={16} /> Upload</Link>
            <button onClick={logout} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <FiLogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}><FiLogIn size={16} /> Login</Link>
            <Link to="/register" className={isActive('/register')}><FiUserPlus size={16} /> Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
      <ToastContainer position="bottom-right" theme="dark" />
    </BrowserRouter>
  );
}
