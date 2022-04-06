/* eslint-disable */
const jwt = require('jsonwebtoken');
const userData = require('../data/users');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials',
      code: 'ERROR_INVALID_CREDENTIALS',
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'ERROR_INVALID_CREDENTIALS',
      });
      return;
    }
    if (user && user.userId) {
      const userExists = await userData.getUserById(user.userId);
      if (userExists === null) {
        res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
          code: 'ERROR_INVALID_CREDENTIALS',
        });
        return;
      }
    }
    req.user = user;
    next();
  });
};
module.exports = verifyToken;
