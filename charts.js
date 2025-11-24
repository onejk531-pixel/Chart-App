const express = require('express');
const multer = require('multer');
const Chart = require('../models/Chart');
const auth = require('../middleware/auth');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb){ cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: function(req, file, cb){ cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('chart'), async (req, res) => {
  try{
    const file = req.file;
    if(!file) return res.status(400).json({ msg: 'No file uploaded' });
    const chart = new Chart({
      userId: req.user.id,
      fileName: file.originalname,
      filePath: '/uploads/' + path.basename(file.path),
      patterns: []
    });
    await chart.save();
    res.json(chart);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', auth, async (req, res) => {
  try{
    const charts = await Chart.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(charts);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

router.get('/filter', auth, async (req, res) => {
  const name = req.query.name || '';
  try{
    const charts = await Chart.find({ userId: req.user.id, 'patterns.name': { $regex: name, $options: 'i' } });
    res.json(charts);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

module.exports = router;
