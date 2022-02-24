const express = require('express');
// const model = require('./models/index');
require('dotenv').config();
const configRoutes = require('./routes');

const app = express();

app.use(express.json());

// model.users.findAll().then((data) => console.log(data));
configRoutes(app);
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
