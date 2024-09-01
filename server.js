const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const errorHandler = require('./middleware/errorHandler');
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { User, Event } = require('./models'); // Import the User and Event models

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create({ helpers });

const sess = {
  secret: 'Super secret secret',
  cookie: {
    maxAge: 300000,
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

// Inform Express.js on which template engine to use
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use(routes);

// Error handling middleware
app.use(errorHandler);

// Sync the database models
sequelize.sync({ force: false }).then(async () => {
  // Ensure User model is synced first
  await User.sync();
  
  // Then sync Event model
  await Event.sync();

  app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
    console.log(`Click here to open: http://localhost:${PORT}`);
  });
});
