const express = require('express');

require('dotenv').config();
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userData = require('../data/users');
const codeData = require('../data/verification_codes');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars');
const auth = require('../middlewares/jwtAuth');

router.post('/register', async (req, res) => {
  if (!req.body.name || !req.body.password || !req.body.email) {
   return res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
  }
  if (userData.checkPassword(req.body.password)) {
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
    const checkDuplication = await userData.checkEmail(user.email);
    if (checkDuplication) {
      const hashedpassword = await bcrypt.hash(user.password, 10);
     await userData.insertUser(user.name, user.email, hashedpassword, false);

     var userId = await userData.getID(user.email)
     var code = getRandomString(6)

      await codeData.insertCode(code,userId)
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email, // your gmail account 
            pass: process.env.Password //  your gmail password
        }
    });

    transporter.use('compile',hbs({
      viewEngine: {
          extname: '.handlebars',
          layoutsDir: './views/',
          defaultLayout : 'code',
      },
      viewPath: './views/'
  }))

  let mailOptions = {
    from: process.env.Email, // TODO: email sender
    to: user.email, // TODO: email receiver
    subject: 'Welcome - Good Enough',
    template: 'code',
    context: {
      userName: user.name,
      code: code

    } // send extra values to template
};

transporter.sendMail(mailOptions, (err, data) => {
  if (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Email server error',
      code: 'ERROR_SERVER',
    });
  }
});
      return  res.status(201).json({
        status: 'success',
        message: 'Success',
        code: 'Success',
      });
    } else {
      return res.status(409).json({
        status: 'error',
        message: 'The email already exist',
        code: 'ERROR_EMAIL_EXIST',
      });
    }
  } catch (e) {
    return res.status(500).json({
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
        throw new Error('Invalid or missing requirements');
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
        res.status(401).json({
          status: 'error',
          message: 'Invalid or missing requirements',
          code: 'ERROR_MISSING_REQUIRED_VALUES',
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
      res.status(201).json({
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

function getRandomString(length) {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < length; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

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

try{
  var userId = await userData.getID(user.email)
  try{
  await codeData.checkCode(userId, user.code)
  }
  catch
  {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication code',
      code: 'ERROR_INVALID_AUTH_CODE',
    });

  }
  return  res.status(201).json({
    status: 'success',
    message: 'Success',
    code: 'Success',
  });
}
catch (e) {
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

    let email = req.body.email

try{
  var user = await userData.getUser(email)
  var temPass = await userData.tempPass(email)
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.Email, // your gmail account 
      pass: process.env.Password //  your gmail password
  }
});

transporter.use('compile',hbs({
viewEngine: {
    extname: '.handlebars',
    layoutsDir: './views/',
    defaultLayout : 'temppass',
},
viewPath: './views/'
}))

let mailOptions = {
from: process.env.Email, // TODO: email sender
to: user.email, // TODO: email receiver
subject: 'Good Enough - temporary password',
template: 'temppass',
context: {
userName: user.name,
code: temPass

} // send extra values to template
};

transporter.sendMail(mailOptions, (err, data) => {
if (err) {
return res.status(500).json({
status: 'error',
message: 'Email server error',
code: 'ERROR_SERVER',
});
}
});
return  res.status(200).json({
  status: 'success',
  message: 'Success',
  code: 'Success',
});
  }
catch (e) {
  return res.status(500).json({
    status: 'error',
    message: 'Server error',
    code: 'ERROR_SERVER',
  });

}

});


router.put('/me', auth, async (req, res) => {
  if (!req.body.name || !req.body.password) {
    return res.status(401).json({
       status: 'error',
       message: 'Missing required values',
       code: 'ERROR_MISSING_REQUIRED_VALUES',
     });
   }
var name = req.body.name 
var pass = req.body.password
   try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId= await userData.getID(decoded);
    await userData.updateUser(userId, name, pass)
    return  res.status(200).json({
      status: 'success',
      message: 'Success',
      code: 'Success',
    });
   }
catch (e) {
  return res.status(500).json({
    status: 'error',
    message: 'Server error',
    code: 'ERROR_SERVER',
  });
}
});

router.get('/resend', async (req, res) => {
  if (!req.body.email) {
    return res.status(422).json({
       status: 'error',
       message: 'Missing required values',
       code: 'ERROR_MISSING_REQUIRED_VALUES',
     });
   }

    let email = req.body.email

try{
  var user = await userData.getUser(email)
  var code = await codeData.getCode(user.id)
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.Email, // your gmail account 
      pass: process.env.Password //  your gmail password
  }
});

transporter.use('compile',hbs({
viewEngine: {
    extname: '.handlebars',
    layoutsDir: './views/',
    defaultLayout : 'code',
},
viewPath: './views/'
}))

let mailOptions = {
from: process.env.Email, // TODO: email sender
to: user.email, // TODO: email receiver
subject: 'Welcome - Good Enough',
template: 'code',
context: {
userName: user.name,
code: code

} // send extra values to template
};

transporter.sendMail(mailOptions, (err, data) => {
if (err) {
return res.status(500).json({
status: 'error',
message: 'Email server error',
code: 'ERROR_SERVER',
});
}
});
return  res.status(200).json({
  status: 'success',
  message: 'Success',
  code: 'Success',
});
  }
catch (e) {
  return res.status(500).json({
    status: 'error',
    message: 'Server error',
    code: 'ERROR_SERVER',
  });

}

});


module.exports = router;
