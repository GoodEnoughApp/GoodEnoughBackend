const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const configRoutes = require('./routes');
// const data = require('./data');
const userModel = require('./models/index');
app.use(express.json());

// userModel['users'].findAll().then((data) => console.log(data));
configRoutes(app);
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
