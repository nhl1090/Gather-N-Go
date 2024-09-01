const router = require('express').Router();
const { Event, User } = require('../../models');
const withAuth = require('../../utils/auth');

// GET all events
router.get('/', async (req, res) => {
  try {
    const eventData = await Event.findAll({
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });
    res.status(200).json(eventData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single event
router.get('/:id', async (req, res) => {
  try {
    const eventData = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    if (!eventData) {
      res.status(404).json({ message: 'No event found with this id!' });
      return;
    }

    res.status(200).json(eventData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new event
router.post('/', withAuth, async (req, res) => {
  try {
    const newEvent = await Event.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newEvent);
  } catch (err) {
    res.status(400).json(err);
  }
});

// UPDATE an event
router.put('/:id', withAuth, async (req, res) => {
  try {
    const updatedEvent = await Event.update(req.body, {
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (updatedEvent[0] === 0) {
      res.status(404).json({ message: 'No event found with this id or you do not have permission to edit this event!' });
      return;
    }

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Edit an event
router.get('/:id/edit', withAuth, async (req, res) => {
  try {
    const eventData = await Event.findByPk(req.params.id);
    if (!eventData) {
      res.status(404).json({ message: 'No event found with this id!' });
      return;
    }
    const event = eventData.get({ plain: true });
    res.render('edit-event', { event, logged_in: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', withAuth, async (req, res) => {
  try {
    const updatedEvent = await Event.update(req.body, {
      where: { id: req.params.id, user_id: req.session.user_id },
    });
    if (!updatedEvent[0]) {
      res.status(404).json({ message: 'No event found with this id!' });
      return;
    }
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE an event
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const eventData = await Event.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!eventData) {
      res.status(404).json({ message: 'No event found with this id!' });
      return;
    }

    res.status(200).json(eventData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;