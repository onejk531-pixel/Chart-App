import React from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';

const features = [
  { icon: <FiCpu />, title: 'AI-Powered Analysis', desc: 'Advanced pattern recognition detects Head & Shoulders, Double Tops, Wedges, and 20+ chart patterns with high confidence.' },
  { icon: <FiTrendingUp />, title: 'Real-Time Insights', desc: 'Get instant analysis results with confidence scores, pattern metadata, and actionable trading signals.' },
  { icon: <FiShield />, title: 'Secure & Private', desc: 'Your charts and analysis data are encrypted and stored securely. JWT authentication protects every request.' },
  { icon: <FiZap />, title: 'Lightning Fast', desc: 'Optimized inference pipeline processes charts in seconds. Upload, analyze, and review without waiting.' },
];

export default function Home() {
  const token = localStorage.getItem('token');

  return (
    <div>
      <section className="hero">
        <h1 className="hero-title">AI-Powered Chart Pattern Recognition</h1>
        <p className="hero-subtitle">
          Upload your financial charts and let our AI instantly identify technical patterns,
          trend signals, and trading opportunities with confidence scoring.
        </p>
        <div className="hero-actions">
          {token ? (
            <>
              <Link to="/upload" className="btn btn-primary">Upload Chart</Link>
              <Link to="/dashboard" className="btn btn-secondary">View Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </>
          )}
        </div>
      </section>

      <div className="page">
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="card feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
