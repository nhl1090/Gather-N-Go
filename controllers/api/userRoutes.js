const router = require('express').Router();
const { User } = require('../../models');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const withAuth = require('../../utils/auth');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET all users
router.get('/', async (req, res) => {
  try {
    const userData = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(userData);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// GET a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const userData = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!userData) {
      return res.status(404).json({ message: 'No user found with this ID!' });
    }
    res.status(200).json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// CREATE a new user (signup)
router.post('/', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('bio').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const userData = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      bio: req.body.bio || null,
      profile_picture: null
    });

    req.session.user_id = userData.id;
    req.session.logged_in = true;

    await req.session.save();

    res.status(200).json({ user: userData, message: 'User created successfully', redirect: '/dashboard' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error while creating user', error: err.message });
  }
});

// User login
router.post('/login', [
  body('login').trim().notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userData = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.login },
          { username: req.body.login }
        ]
      }
    });
    if (!userData) {
      return res.status(400).json({ message: 'Incorrect email/username or password, please try again' });
    }

    const validPassword = await userData.checkPassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Incorrect email/username or password, please try again' });
    }

    req.session.user_id = userData.id;
    req.session.logged_in = true;

    await req.session.save();

    res.json({ 
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        profile_picture: userData.profile_picture
      }, 
      message: 'You are now logged in!',
      redirect: '/dashboard'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).json({ message: 'No active session found' });
  }
});

// UPDATE user bio
router.put('/bio', withAuth, [
  body('bio').trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [updatedRows] = await User.update(
      { bio: req.body.bio },
      { where: { id: req.session.user_id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'No user found with this ID!' });
    }

    res.status(200).json({ message: 'Bio updated successfully' });
  } catch (err) {
    console.error('Error updating bio:', err);
    res.status(500).json({ message: 'Server error while updating bio' });
  }
});

// UPDATE user profile picture
router.post('/profile-picture', withAuth, upload.single('profile-pic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;

    const [updatedRows] = await User.update(
      { profile_picture: profilePicturePath },
      { where: { id: req.session.user_id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'No user found with this ID!' });
    }

    res.status(200).json({ message: 'Profile picture updated successfully', profile_picture: profilePicturePath });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error while updating profile picture' });
  }
});

module.exports = router;