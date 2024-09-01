const router = require('express').Router();
const { RSVP, Event } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', withAuth, async (req, res) => {
  try {
    if (!req.body.event_id) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const existingRSVP = await RSVP.findOne({
      where: {
        user_id: req.session.user_id,
        event_id: req.body.event_id
      }
    });

    if (existingRSVP) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    const newRSVP = await RSVP.create({
      user_id: req.session.user_id,
      event_id: req.body.event_id,
    });

    res.status(200).json(newRSVP);
  } catch (err) {
    console.error('RSVP creation error:', err);
    res.status(500).json({ message: 'Failed to create RSVP', error: err.message });
  }
});

router.get('/user', withAuth, async (req, res) => {
  try {
    const userRSVPs = await RSVP.findAll({
      where: {
        user_id: req.session.user_id,
      },
      include: [{ model: Event }],
    });

    res.status(200).json(userRSVPs);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;