const sequelize = require('../config/connection');
const { User, Event } = require('../models');

const userData = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password456'
  }
];

const eventData = [
  {
    title: 'Local Food Festival',
    description: 'Join us for a celebration of local cuisine and culture!',
    date: '2024-09-15 12:00:00',
    location: 'Downtown Square',
    user_id: 1
  },
  {
    title: 'Tech Meetup',
    description: 'Network with local tech professionals and learn about the latest innovations.',
    date: '2024-08-20 18:30:00',
    location: 'TechHub Co-working Space',
    user_id: 2
  },
  {
    title: 'Charity Fun Run',
    description: '5K run to raise funds for local charities. All skill levels welcome!',
    date: '2024-10-01 09:00:00',
    location: 'City Park',
    user_id: 1
  },
  {
    title: 'Art Gallery Opening',
    description: 'Be the first to see new works from up-and-coming local artists.',
    date: '2024-07-07 19:00:00',
    location: 'Downtown Art Gallery',
    user_id: 2
  }
];

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const users = await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
  });

  for (const event of eventData) {
    await Event.create({
      ...event,
      user_id: users[Math.floor(Math.random() * users.length)].id,
    });
  }

  process.exit(0);
};

seedDatabase();