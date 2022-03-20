require('dotenv').config();

module.exports = {
  local: {
    dialect: 'postgres',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    logging: process.env.DB_LOGGING === 1 ? console.log : null,
    dialectOptions: {
      ssl: {
        // For secure connection:
        ca: process.env.DB_CRT,
        rejectUnauthorized: false,
      },
    },
  },
  development: {
    dialect: 'postgres',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    logging: process.env.DB_LOGGING === 1 ? console.log : null,
    dialectOptions: {
      ssl: {
        // For secure connection:
        ca: process.env.DB_CRT,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    dialect: 'postgres',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    logging: process.env.DB_LOGGING === 1 ? console.log : null,
    dialectOptions: {
      ssl: {
        // For secure connection:
        ca: process.env.DB_CRT,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    dialect: 'postgres',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    logging: process.env.DB_LOGGING === 1 ? console.log : null,
    dialectOptions: {
      ssl: {
        // For secure connection:
        ca: process.env.DB_CRT,
        rejectUnauthorized: false,
      },
    },
  },
};
