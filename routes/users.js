const express = require('express');

require('dotenv').config();

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userData = require('../data/users');
const codeData = require('../data/verificationCodes');
const auth = require('../middlewares/jwtAuth');
const verify = require('../middlewares/validation');

// user sign up
// eslint-disable-next-line consistent-return
router.post('/register', async (req, res) => {
  if (!req.body.name || !req.body.password || !req.body.email) {
    return res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  if (userData.checkPassword(req.body.password)) {
    // check if password length < 8
    return res.status(422).json({
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
    const checkDuplication = await userData.checkEmail(user.email); // check if email exists
    if (checkDuplication) {
      // Email does not exist - new email
      const hashedpassword = await bcrypt.hash(user.password, 10);
      await userData.insertUser(user.name, user.email, hashedpassword, false);
      const userId = await userData.getID(user.email);
      // var code = userData.getRandomString(6);
      const code = userData.getActivationCode();
      await codeData.insertCode(code, userId);
      userData.emailSetup('Welcome - Good Enough', 'code', user.name, user.email, code);

      res.status(201).json({
        status: 'success',
        message: 'Success',
        code: 'Success',
      });

      // eslint-disable-next-line consistent-return
      return;
    }

    res.status(409).json({
      status: 'error',
      message: 'The email already exist',
      code: 'ERROR_EMAIL_EXIST',
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// User Authentication using JWT
router.post('/login', async (req, res) => {
  try {
    try {
      if (
        !req.body ||
        !verify.validEmail(req.body.email) ||
        !verify.validString(req.body.password)
      ) {
        throw new Error('Missing required values');
      }
    } catch (error) {
      res.status(422).json({
        status: 'error',
        message: error.message,
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
      let twoMonthsFromNow = d.setDate(d.getDate() + 60);
      twoMonthsFromNow = new Date(twoMonthsFromNow).toISOString();
      const tokenValue = {
        userId: users.userId,
        email,
        expiredAt: twoMonthsFromNow,
      };
      const authToken = jwt.sign(tokenValue, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '60d',
      });
      res.status(200).json({
        authToken,
        expiredAt: twoMonthsFromNow,
        status: 'success',
      });
    }
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Confirm verification code
router.post('/register/verify', async (req, res) => {
  if (!req.body.email || !req.body.verificationCode) {
    return res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  const user = {
    code: req.body.verificationCode,
    email: req.body.email,
  };

  try {
    const userId = await userData.getID(user.email);
    try {
      await codeData.checkCode(userId, user.code);
    } catch {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication code',
        code: 'ERROR_INVALID_AUTH_CODE',
      });
    }
    return res.status(201).json({
      status: 'success',
      message: 'Success',
      code: 'Success',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

router.post('/forgot', async (req, res) => {
  if (!req.body.email) {
    return res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }

  const { email } = req.body;

  try {
    const user = await userData.getUser(email);
    const temPass = await userData.tempPass(email);
    userData.emailSetup(
      'Good Enough - temporary password',
      'temppass',
      user.name,
      user.email,
      temPass
    );

    return res.status(200).json({
      status: 'success',
      message: 'Success',
      code: 'Success',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// update user information
router.put('/me', auth, async (req, res) => {
  if (!req.body.name || !req.body.password) {
    return res.status(401).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  const { name, password } = req.body;
  try {
    if (userData.checkPassword(password)) {
      // check if password < 8
      return res.status(422).json({
        status: 'error',
        message: 'Password less than 8 char.',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    const userId = await userData.getID(req.user.email);
    await userData.updateUser(userId, name, password);
    return res.status(200).json({
      status: 'success',
      message: 'Success',
      code: 'Success',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// get user information
router.get('/me', auth, async (req, res) => {
  try {
    const decoded = req.user;
    const userInformation = await userData.getUserById(decoded.userId);
    if (userInformation !== null) {
      res.status(200).json({
        status: 'success',
        userId: userInformation.id,
        name: userInformation.name,
        email: userInformation.email,
        expiredAt: decoded.expiredAt,
      });
      return;
    }

    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials',
      code: 'ERROR_INVALID_CREDENTIALS',
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message,
      code: 'ERROR_SERVER',
    });
  }
});

// resend verification code
router.get('/resend', async (req, res) => {
  if (!req.body.email) {
    return res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  const { email } = req.body;
  try {
    const user = await userData.getUser(email);
    const code = await codeData.getCode(user.id);
    userData.emailSetup('Welcome - Good Enough', 'code', user.name, user.email, code);
    return res.status(200).json({
      status: 'success',
      message: 'Success',
      code: 'Success',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// check status
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Success',
    code: 'Success',
  });
});

module.exports = router;
