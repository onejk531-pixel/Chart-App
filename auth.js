const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try{
    if(!email || !password) return res.status(400).json({ msg: 'Provide email and password' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ msg: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ email, passwordHash });
    await user.save();
    res.status(201).json({ msg: 'User created' });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
