const router = require('express').Router();
const { Event, User, RSVP } = require('../models');
const withAuth = require('../utils/auth');
const { Op } = require('sequelize');

// Home page route
router.get('/', async (req, res) => {
  try {
    const eventData = await Event.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['date', 'ASC']], // Sort events by date, ascending
    });

    const events = eventData.map((event) => event.get({ plain: true }));

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
      include: [
        { model: Event },
        { model: Event, as: 'rsvp_events', through: RSVP }
      ],
    });

    if (!userData) {
      res.status(404).render('error', { message: 'User not found.' });
      return;
    }

    const user = userData.get({ plain: true });

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
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Event },
        { model: Event, as: 'rsvp_events', through: RSVP }
      ],
    });

    if (!userData) {
      res.status(404).render('error', { message: 'User not found.' });
      return;
    }

    const user = userData.get({ plain: true });

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
    const eventData = await Event.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!eventData) {
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