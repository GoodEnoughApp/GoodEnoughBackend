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
    var check_duplication = await userData.checkEmail(user.email);
    if (check_duplication) {
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
      let data = req.body;
      if (!data || data.email === '') throw `Invalid or missing requirements`;
      //   valid.userNameValidation(data.username);
      if (!data || data.password === '')
        throw `Invalid or missing requirements`;
      //   valid.passwordValidation(data.password);
    } catch (error) {
      res.status(422).json({
        status: 'error',
        message: error,
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    try {
      const { email, password } = data;
      let users = await usersData.checkUser(email, password);
      if (users.authenticated === true) {
        res.status(201).json({
          status: 'success',
          message: 'Success',
          code: 'Success',
        });
      }
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'ERROR_INVALID_CREDENTIALS',
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
