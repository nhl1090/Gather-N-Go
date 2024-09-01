const router = require('express').Router();
const { Event, User } = require('../models');
const withAuth = require('../utils/auth');
const { Op } = require('sequelize');

// Home page route
router.get('/', async (req, res) => {
  try {
    const eventData = await Event.findAll({
      include: [{ model: User, attributes: ['username'] }],
    });

    const events = eventData.map((event) => event.get({ plain: true }));

    res.render('home', { 
      events, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    console.error('Error in home route:', err);
    res.status(500).json(err);
  }
});

// Login route
router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('signup');
});

// Dashboard route
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Event }],
    });

    const user = userData.get({ plain: true });

    res.render('dashboard', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    console.error('Error in dashboard route:', err);
    res.status(500).json(err);
  }
});

// Profile route
router.get('/profile', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Event }],
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    console.error('Error in profile route:', err);
    res.status(500).json(err);
  }
});

// Single event route
router.get('/event/:id', async (req, res) => {
  try {
    const eventData = await Event.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!eventData) {
      res.status(404).json({ message: 'No event found with this id!' });
      return;
    }

    const event = eventData.get({ plain: true });

    res.render('event', {
      ...event,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    console.error('Error in single event route:', err);
    res.status(500).json(err);
  }
});

router.get('/search', async (req, res) => {
  try {
    console.log('Search route hit');
    console.log('Search term:', req.query.search);
    
    const searchTerm = req.query.search;
    const eventData = await Event.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      include: [{ model: User, attributes: ['username'] }],
    });

    const events = eventData.map((event) => event.get({ plain: true }));

    console.log('Events found:', events.length);

    res.render('search-results', { 
      events, 
      searchTerm,
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    console.error('Error in search route:', err);
    res.status(500).json(err);
  }
});

module.exports = router;