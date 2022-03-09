const users = require('./users');
const products = require('./products');
const category = require('./category');
const items = require('./items');
const shopping = require('./shopping');
const constructorMethod = (app) => {
  app.use('/', users);
  app.use('/products', products);
  app.use('/categories', category);
  app.use('/items', items);
  app.use('/shopping', shopping);
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
