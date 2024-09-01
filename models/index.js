const User = require('./user');
const Event = require('./event');
const RSVP = require('./rsvp');

User.hasMany(Event, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Event.belongsTo(User, {
  foreignKey: 'user_id'
});

User.belongsToMany(Event, {
  through: RSVP,
  as: 'rsvp_events',
  foreignKey: 'user_id'
});

Event.belongsToMany(User, {
  through: RSVP,
  as: 'rsvp_users',
  foreignKey: 'event_id'
});

module.exports = { User, Event, RSVP };