const router = require('express').Router();
const { Event, User, RSVP } = require('../models');
const withAuth = require('../utils/auth');
const { Op } = require('sequelize');

// Home page route
router.get('/', async (req, res) => {
  try {
    console.log('Home route hit');
    const eventData = await Event.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['date', 'ASC']], // Sort events by date, ascending
    });

    const events = eventData.map((event) => event.get({ plain: true }));

    console.log(`Rendering home with ${events.length} events`);
    res.render('home', { 
      events, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    console.error('Error in home route:', err);
    res.status(500).render('error', { message: 'Error loading events. Please try again later.' });
  }
});

// Login route
router.get('/login', (req, res) => {
  console.log('Login page route hit');
  if (req.session.logged_in) {
    console.log('User already logged in, redirecting to dashboard');
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
  console.log('Signup page route hit');
  if (req.session.logged_in) {
    console.log('User already logged in, redirecting to dashboard');
    res.redirect('/dashboard');
    return;
  }

  res.render('signup');
});

// Dashboard route
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    console.log('Dashboard route hit');
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Event },
        { model: Event, as: 'rsvp_events', through: RSVP }
      ],
    });

    if (!userData) {
      console.log('User not found');
      res.status(404).render('error', { message: 'User not found.' });
      return;
    }

    const user = userData.get({ plain: true });

    console.log(`Rendering dashboard for user: ${user.username}`);
    res.render('dashboard', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    console.error('Error in dashboard route:', err);
    res.status(500).render('error', { message: 'Error loading dashboard. Please try again later.' });
  }
});

// Profile route
router.get('/profile', withAuth, async (req, res) => {
  try {
    console.log('Profile route hit');
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Event },
        { model: Event, as: 'rsvp_events', through: RSVP }
      ],
    });

    if (!userData) {
      console.log('User not found');
      res.status(404).render('error', { message: 'User not found.' });
      return;
    }

    const user = userData.get({ plain: true });

    console.log(`Rendering profile for user: ${user.username}`);
    res.render('profile', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    console.error('Error in profile route:', err);
    res.status(500).render('error', { message: 'Error loading profile. Please try again later.' });
  }
});

// Single event route
router.get('/event/:id', async (req, res) => {
  try {
    console.log(`Single event route hit for event ID: ${req.params.id}`);
    const eventData = await Event.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!eventData) {
      console.log('Event not found');
      res.status(404).render('error', { message: 'No event found with this id!' });
      return;
    }

    const event = eventData.get({ plain: true });

    // Check if the logged-in user has RSVP'd to this event
    let hasRSVP = false;
    if (req.session.logged_in) {
      const rsvp = await RSVP.findOne({
        where: {
          user_id: req.session.user_id,
          event_id: event.id
        }
      });
      hasRSVP = !!rsvp;
    }

    console.log(`Rendering event: ${event.title}`);
    res.render('event', {
      ...event,
      logged_in: req.session.logged_in,
      hasRSVP
    });
  } catch (err) {
    console.error('Error in single event route:', err);
    res.status(500).render('error', { message: 'Error loading event. Please try again later.' });
  }
});

// Search route
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
      order: [['date', 'ASC']], // Sort search results by date, ascending
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
    res.status(500).render('error', { message: 'Error performing search. Please try again later.' });
  }
});

module.exports = router;