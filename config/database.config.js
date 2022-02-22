require('dotenv').config();
const fs = require('fs');
module.exports = {
    local: {
        dialect: 'postgres',
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
        logging: process.env.DB_LOGGING == 1 ? console.log : null,
        dialectOptions: {
            ssl: {
                //For secure connection:
                ca: fs
                    .readFileSync(`${__dirname}\\..\\certs\\cc-ca.crt`)
                    .toString(),
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
        logging: process.env.DB_LOGGING == 1 ? console.log : null,
        dialectOptions: {
            ssl: {
                //For secure connection:
                ca: fs
                    .readFileSync(`${__dirname}\\..\\certs\\cc-ca.crt`)
                    .toString(),
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
        logging: process.env.DB_LOGGING == 1 ? console.log : null,
        dialectOptions: {
            ssl: {
                //For secure connection:
                ca: fs
                    .readFileSync(`${__dirname}\\..\\certs\\cc-ca.crt`)
                    .toString(),
            },
        },
    },
};
