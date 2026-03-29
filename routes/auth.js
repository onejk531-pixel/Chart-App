const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');
const router = express.Router();

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array()[0].msg });
    return false;
  }
  return true;
};

router.post('/register', [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: PASSWORD_MIN }).withMessage(`Password must be at least ${PASSWORD_MIN} characters`)
    .isLength({ max: PASSWORD_MAX }).withMessage(`Password must not exceed ${PASSWORD_MAX} characters`)
], async (req, res) => {
  try {
    if (!validate(req, res)) return;
    const { email, password } = req.body;

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ msg: 'An account with this email already exists' });

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ email, passwordHash });
    await user.save();

    res.status(201).json({ msg: 'Account created successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'An account with this email already exists' });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Registration failed. Please try again.' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    if (!validate(req, res)) return;
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Login failed. Please try again.' });
  }
});

module.exports = router;
