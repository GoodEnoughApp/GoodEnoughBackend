const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars');
const models = require('../models/index');

// Insert a record
async function insertUser(name, email, password, isActivated) {
  await models.user
    .create({
      name,
      email: email.toLowerCase(),
      password,
      is_activated: isActivated,
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });
}

// check if email exists - sign up
// true --> no record , false --> record exists
async function checkEmail(email) {
  const emails = await models.user
    .findAll({
      where: {
        email: email.toLowerCase(),
      },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });
  if (!emails.length) return true;
  return false;
}

// return ID from Email
async function getID(email) {
  email = email.toString().trim().toLowerCase();
  const getUser = await models.user
    .findOne({
      where: { email },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });

  return getUser.id;
}

// check password length - Sign up
function checkPassword(Password) {
  if (Password.toString().length < 8) {
    return true;
  }
  return false;
}

// sign in function
const checkUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Invalid or missing requirements');
  }
  const user = await models.user.findOne({
    where: { email: email.trim().toLowerCase() },
  });
  if (user === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    const passwordCompare = await bcrypt.compare(password, user.dataValues.password);
    if (passwordCompare) {
      if (user.dataValues.is_activated) {
        return {
          authenticated: true,
          verified: true,
          userId: user.dataValues.id,
        };
      }
    }
    throw new Error('Invalid or missing requirements');
  }
};

// forget password
async function tempPass(email) {
  if (!email) {
    throw new Error('Invalid or missing requirements');
  }
  const userData = await models.user.findOne({
    where: { email: email.toLowerCase() },
  });
  if (userData === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    var pass = getRandomString(8);
    const hashedpassword = await bcrypt.hash(pass, 10);

    await models.user.update({ password: hashedpassword }, { where: { id: userData.id } });
  }
  return pass;
}

// Get random characters
function getRandomString(length) {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// return user from Email
async function getUser(email) {
  email = email.trim().toLowerCase();
  const getUser = await models.user
    .findOne({
      where: { email },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });

  return getUser;
}

// update: password - user name
async function updateUser(userId, name, password) {
  if (!userId || !name || !password) {
    throw new Error('Invalid or missing requirements');
  }
  const hashedpassword = await bcrypt.hash(password, 10);

  await models.user.update({ name, password: hashedpassword }, { where: { id: userId } });
}

// Start: Code added by Jose.
function getActivationCode() {
  return padLeadingZeros(randomNumber(0, 999999), 6);
}

function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padLeadingZeros(num, size) {
  let s = `${num  }`;
  while (s.length < size) s = `0${  s}`;
  return s;
}
// end

// Setup email
function emailSetup(title, templateName, userName, email, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.Email,
      pass: process.env.Password,
    },
  });
  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        extname: '.handlebars',
        layoutsDir: './views/',
        defaultLayout: templateName,
      },
      viewPath: './views/',
    })
  );
  const mailOptions = {
    from: process.env.Email,
    to: email,
    subject: title,
    template: templateName,
    context: {
      userName,
      code,
    },
  };
  transporter.sendMail(mailOptions);
  
}

const getUserById = async (userId) => {
  const user = await models.user
    .findOne({
      where: {
        id: userId,
      },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });
  return user;
};

module.exports = {
  insertUser,
  checkEmail,
  checkPassword,
  checkUser,
  getID,
  tempPass,
  getUser,
  updateUser,
  getActivationCode,
  emailSetup,
  getUserById,
  // getRandomString,
};
