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
      throw err;
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
      throw err;
    });
  if (!emails.length) return true;
  return false;
}

// return ID from Email
async function getID(email) {
  const userEmail = email.toString().trim().toLowerCase();
  const userDetails = await models.user
    .findOne({
      where: { email: userEmail },
    })
    .catch((err) => {
      throw err;
    });

  return userDetails.id;
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

// Get random characters
function getRandomString(length) {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// forget password
async function tempPass(email) {
  let pass;
  if (!email) {
    throw new Error('Invalid or missing requirements');
  }
  const userData = await models.user.findOne({
    where: { email: email.toLowerCase() },
  });
  if (userData === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    pass = getRandomString(8);
    const hashedpassword = await bcrypt.hash(pass, 10);

    await models.user.update({ password: hashedpassword }, { where: { id: userData.id } });
  }
  return pass;
}

// return user from Email
async function getUser(email) {
  const userEmail = email.trim().toLowerCase();
  const getOneUser = await models.user
    .findOne({
      where: { email: userEmail },
    })
    .catch((err) => {
      throw err;
    });

  return getOneUser;
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

function padLeadingZeros(num, size) {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
}

function randomNumber(min, max) {
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

function getActivationCode() {
  return padLeadingZeros(randomNumber(0, 999999), 6);
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
      throw err;
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
