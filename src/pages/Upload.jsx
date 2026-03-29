import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiFile, FiX, FiCheck } from 'react-icons/fi';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleFile = (f) => {
    if (!f) return;
    const valid = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!valid.includes(f.type)) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)');
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Select a file first'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('chart', file);
      const res = await axios.post('/api/charts/upload', formData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(res.data);
      toast.success('Chart uploaded and analyzed!');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.msg || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Chart</h1>
          <p className="page-subtitle">Upload a financial chart image for AI analysis</p>
        </div>
      </div>

      {!file ? (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="upload-area-icon"><FiUploadCloud /></div>
          <p className="upload-area-text">Drag and drop your chart image here</p>
          <p className="upload-area-hint">or click to browse &middot; PNG, JPG, WebP, GIF supported</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          {preview && (
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, marginBottom: 16 }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, color: '#9999b0' }}>
            <FiFile size={16} />
            <span>{file.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#666680' }}>({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={reset}><FiX size={16} /> Change File</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><FiUploadCloud size={16} /> Upload &amp; Analyze</>}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#00c896' }}>
            <FiCheck size={20} />
            <span style={{ fontWeight: 600 }}>Analysis Complete</span>
          </div>
          <p style={{ color: '#9999b0', marginBottom: 12 }}>File: {result.fileName}</p>
          {result.patterns?.length > 0 ? (
            <div className="analysis-result">
              {result.patterns.map((p, i) => {
                const conf = parseFloat(p.confidence);
                const cls = conf >= 0.8 ? 'high' : conf >= 0.5 ? 'medium' : 'low';
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
            <p style={{ color: '#666680' }}>No patterns detected. Try uploading a different chart.</p>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={reset}>Upload Another</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>View Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
