const users = require('./users');

const constructorMethod = (app) => {
  app.use('/', users);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
