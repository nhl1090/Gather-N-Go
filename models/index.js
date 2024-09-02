const User = require('./user');
const Event = require('./event');
const RSVP = require('./rsvp');

// User has many Events
User.hasMany(Event, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE', // If a user is deleted, their events are also deleted
});

// Event belongs to User
Event.belongsTo(User, {
  foreignKey: 'user_id',
});

// Many-to-Many relationship between User and Event through RSVP
User.belongsToMany(Event, {
  through: RSVP,
  as: 'rsvp_events',
  foreignKey: 'user_id',
});

Event.belongsToMany(User, {
  through: RSVP,
  as: 'rsvp_users',
  foreignKey: 'event_id',
});

RSVP.belongsTo(User, { foreignKey: 'user_id' });
RSVP.belongsTo(Event, { foreignKey: 'event_id' });
User.hasMany(RSVP, { foreignKey: 'user_id' });
Event.hasMany(RSVP, { foreignKey: 'event_id' });

module.exports = { User, Event, RSVP };
