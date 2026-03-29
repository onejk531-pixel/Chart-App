import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiUpload, FiBarChart2, FiTrendingUp, FiClock, FiX, FiImage } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#9999b0' } } },
  scales: {
    x: { ticks: { color: '#9999b0' }, grid: { color: '#2a2a40' } },
    y: { ticks: { color: '#9999b0' }, grid: { color: '#2a2a40' } }
  }
};

function getConfidenceClass(c) {
  const val = parseFloat(c);
  if (val >= 0.8) return 'high';
  if (val >= 0.5) return 'medium';
  return 'low';
}

export default function Dashboard() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    loadCharts();
  }, [navigate]);

  const loadCharts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/charts/list', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setCharts(Array.isArray(res.data) ? res.data : res.data.charts || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load charts');
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return charts;
    const q = search.toLowerCase();
    return charts.filter(c =>
      c.fileName.toLowerCase().includes(q) ||
      c.patterns?.some(p => p.name.toLowerCase().includes(q))
    );
  }, [charts, search]);

  const patternCounts = useMemo(() => {
    const counts = {};
    charts.forEach(c => c.patterns?.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    }));
    return counts;
  }, [charts]);

  const avgConfidence = useMemo(() => {
    const all = charts.flatMap(c => c.patterns?.map(p => parseFloat(p.confidence)) || []);
    if (all.length === 0) return 0;
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(2);
  }, [charts]);

  const doughnutData = {
    labels: Object.keys(patternCounts),
    datasets: [{
      data: Object.values(patternCounts),
      backgroundColor: ['#6c63ff', '#00c896', '#ffb347', '#ff4757', '#8b83ff', '#36d7b7'],
      borderWidth: 0
    }]
  };

  const barLabels = Object.keys(patternCounts);
  const barData = {
    labels: barLabels,
    datasets: [{
      label: 'Occurrences',
      data: barLabels.map(l => patternCounts[l]),
      backgroundColor: '#6c63ff',
      borderRadius: 6
    }]
  };

  if (loading) {
    return <div className="loading-overlay"><div className="spinner" /><span>Loading charts...</span></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your chart analysis overview</p>
        </div>
        <Link to="/upload" className="btn btn-primary"><FiUpload size={16} /> Upload Chart</Link>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-icon purple"><FiBarChart2 /></div>
          <div><div className="stat-value">{charts.length}</div><div className="stat-label">Total Charts</div></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div><div className="stat-value">{Object.keys(patternCounts).length}</div><div className="stat-label">Patterns Found</div></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><FiClock /></div>
          <div><div className="stat-value">{avgConfidence}</div><div className="stat-label">Avg Confidence</div></div>
        </div>
      </div>

      {charts.length > 0 && Object.keys(patternCounts).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="chart-container">
            <h3>Pattern Distribution</h3>
            <div style={{ height: 220 }}><Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined }} /></div>
          </div>
          <div className="chart-container">
            <h3>Pattern Frequency</h3>
            <div style={{ height: 220 }}><Bar data={barData} options={chartOptions} /></div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch size={16} />
          <input
            placeholder="Search by filename or pattern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiImage /></div>
          <p className="empty-state-text">{search ? 'No charts match your search' : 'No charts uploaded yet'}</p>
          <p className="empty-state-hint">{search ? 'Try a different search term' : 'Upload your first chart to get started'}</p>
        </div>
      ) : (
        <div className="charts-grid">
          {filtered.map((c) => (
            <div key={c._id} className="card chart-card" onClick={() => setSelected(c)}>
              {c.filePath && (
                <img src={c.filePath} alt={c.fileName} className="chart-card-image" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="chart-card-header">
                <span className="chart-card-title">{c.fileName}</span>
                <span className="chart-card-date">{c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : ''}</span>
              </div>
              <div className="chart-card-patterns">
                {c.patterns?.map((p, i) => (
                  <span key={i} className={`pattern-badge ${getConfidenceClass(p.confidence)}`}>
                    {p.name} ({(parseFloat(p.confidence) * 100).toFixed(0)}%)
                  </span>
                ))}
                {(!c.patterns || c.patterns.length === 0) && <span className="pattern-badge">No patterns</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.fileName}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX size={20} /></button>
            </div>
            {selected.filePath && (
              <img src={selected.filePath} alt={selected.fileName} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            <p style={{ color: '#9999b0', fontSize: '0.85rem', marginBottom: 16 }}>
              Uploaded: {selected.createdAt ? format(new Date(selected.createdAt), 'MMMM d, yyyy h:mm a') : 'Unknown'}
            </p>
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Detected Patterns</h3>
            {selected.patterns?.length > 0 ? (
              <div className="analysis-result">
                {selected.patterns.map((p, i) => {
                  const conf = parseFloat(p.confidence);
                  const cls = getConfidenceClass(p.confidence);
                  return (
                    <div key={i} className="analysis-pattern">
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.85rem', color: '#9999b0' }}>{(conf * 100).toFixed(1)}%</span>
                        <div className="confidence-bar">
                          <div className={`confidence-fill ${cls}`} style={{ width: `${conf * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#666680' }}>No patterns detected for this chart.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
