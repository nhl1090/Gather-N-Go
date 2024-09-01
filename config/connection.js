const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL, {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Allows SSL connections in production
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: 'localhost',
        dialect: 'postgres',
        pool: {
          max: 5, // Maximum number of connection in pool
          min: 0, // Minimum number of connection in pool
          acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
          idle: 10000, // Maximum time, in milliseconds, that a connection can be idle before being released
        },
      }
    );

module.exports = sequelize;
