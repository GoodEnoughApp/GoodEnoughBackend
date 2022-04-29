const usersData = require('./users');
const productsData = require('./products');
const categoryData = require('./category');
const itemData = require('./items');
const codesData = require('./verificationCodes');

module.exports = {
  users: usersData,
  products: productsData,
  codes: codesData,
  category: categoryData,
  item: itemData,
};
