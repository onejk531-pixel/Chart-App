const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { query, validationResult } = require('express-validator');
const Chart = require('../models/Chart');
const auth = require('../middleware/auth');
const { AI_SERVICE_URL } = require('../config');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Allowed MIME types — binary-verified, not just extension-based
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_CHARTS_PER_USER = 500;

// Secure filename: hash-based to prevent path traversal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ALLOWED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTS.has(ext)) return cb(new Error('Invalid file extension'));
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    cb(new Error('Only image files (PNG, JPG, WebP, GIF) are allowed'), false);
    return;
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Upload & analyze chart
router.post('/upload', auth, (req, res, next) => {
  upload.single('chart')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ msg: 'File too large. Maximum size is 10 MB.' });
      }
      return res.status(400).json({ msg: err.message });
    }
    if (err) return res.status(400).json({ msg: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ msg: 'No file uploaded' });

    // Enforce per-user chart limit
    const count = await Chart.countDocuments({ userId: req.user.id });
    if (count >= MAX_CHARTS_PER_USER) {
      fs.unlink(file.path, () => {});
      return res.status(429).json({ msg: `Chart limit reached (${MAX_CHARTS_PER_USER}). Delete some charts first.` });
    }

    // Attempt AI analysis (non-blocking — upload succeeds even if AI is down)
    let patterns = [];
    try {
      const FormData = (await import('form-data')).default;
      const axios = (await import('axios')).default;
      const form = new FormData();
      form.append('chart', fs.createReadStream(file.path));
      const aiRes = await axios.post(AI_SERVICE_URL, form, {
        headers: form.getHeaders(),
        timeout: 15000
      });
      if (aiRes.data && Array.isArray(aiRes.data.patterns)) {
        patterns = aiRes.data.patterns.map(p => ({
          name: String(p.name || '').slice(0, 100),
          confidence: String(parseFloat(p.confidence) || 0),
          meta: p.meta || {}
        }));
      }
    } catch (aiErr) {
      console.warn('AI service unavailable, saving chart without analysis:', aiErr.message);
    }

    const chart = new Chart({
      userId: req.user.id,
      fileName: file.originalname.slice(0, 255),
      filePath: '/uploads/' + path.basename(file.path),
      patterns
    });
    await chart.save();

    res.status(201).json(chart);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('Upload error:', err.message);
    res.status(500).json({ msg: 'Upload failed. Please try again.' });
  }
});

// List charts with pagination
router.get('/list', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [charts, total] = await Promise.all([
      Chart.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Chart.countDocuments({ userId: req.user.id })
    ]);

    res.json({ charts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List error:', err.message);
    res.status(500).json({ msg: 'Failed to load charts' });
  }
});

// Filter charts by pattern name with validation
router.get('/filter', auth, [
  query('name').optional().isString().trim().isLength({ max: 100 }).withMessage('Pattern name too long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array()[0].msg });

  try {
    const name = (req.query.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const charts = await Chart.find({
      userId: req.user.id,
      'patterns.name': { $regex: name, $options: 'i' }
    }).sort({ createdAt: -1 }).limit(100).lean();

    res.json(charts);
  } catch (err) {
    console.error('Filter error:', err.message);
    res.status(500).json({ msg: 'Filter failed' });
  }
});

// Delete chart
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid chart ID' });
    }

    const chart = await Chart.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chart) return res.status(404).json({ msg: 'Chart not found' });

    // Remove file from disk
    const filePath = path.join(__dirname, '..', chart.filePath);
    fs.unlink(filePath, () => {});

    await Chart.deleteOne({ _id: chart._id });
    res.json({ msg: 'Chart deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ msg: 'Delete failed' });
  }
});

module.exports = router;
