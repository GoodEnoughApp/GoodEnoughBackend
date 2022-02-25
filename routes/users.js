const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userData = require('../data/users');

router.post('/register', async (req, res) => {
  if (!req.body.name || !req.body.password || !req.body.email) {
    res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  if (userData.checkPassword(req.body.password)) {
    res.status(422).json({
      status: 'error',
      message: 'Password less than 8 char.',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  const user = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
  };
  try {
    const checkDuplication = await userData.checkEmail(user.email);
    if (checkDuplication) {
      const hashedpassword = await bcrypt.hash(user.password, 10);
      await userData.insertUser(user.name, user.email, hashedpassword, false);
      res.status(201).json({
        status: 'success',
        message: 'Success',
        code: 'Success',
      });
    } else {
      res.status(409).json({
        status: 'error',
        message: 'The email already exist',
        code: 'ERROR_EMAIL_EXIST',
      });
    }
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    try {
      if (!req.body || req.body.email === '' || req.body.password === '') {
        throw new Error('Missing required values');
      }
      userData.checkPassword(req.body.password);
    } catch (error) {
      res.status(422).json({
        status: 'error',
        message: error,
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    let users;
    const { email, password } = req.body;
    try {
      users = await userData.checkUser(email, password);
      if (!users.verified) {
        res.status(409).json({
          status: 'error',
          message: 'This user account is not activated',
          code: 'ERROR_IS_NOT_ACTIVATED',
        });
        return;
      }
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'ERROR_INVALID_CREDENTIALS',
      });
      return;
    }
    if (users.authenticated === true) {
      const d = new Date();
      let twoMonthsFromNow = d.setMonth(d.getMonth() + 2);
      twoMonthsFromNow = new Date(twoMonthsFromNow).toISOString();
      const authToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({
        authToken: authToken,
        expiredAt: twoMonthsFromNow,
        status: 'success',
      });
    }
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});
module.exports = router;
