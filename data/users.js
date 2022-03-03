const bcrypt = require('bcrypt');
const models = require('../models/index');

// Insert a record
async function insertUser(name, email, password, isActivated) {
  await models.users
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
  const emails = await models.users
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
  email = email.trim().toLowerCase();
  const getUser = await models.users
    .findOne({
      where: { email: email },
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
  const user = await models.users.findOne({
    where: { email: email.trim().toLowerCase() },
  });
  if (user === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    const passwordCompare = await bcrypt.compare(
      password,
      user.dataValues.password
    );
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

// set temp password - forget password
async function tempPass(email) {
  if (!email) {
    throw new Error('Invalid or missing requirements');
  }
  const userData = await models.users.findOne({
    where: { email: email.toLowerCase() },
  });
  if (userData === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    var pass = getRandomString(8);
    const hashedpassword = await bcrypt.hash(pass, 10);

    await models.users.update(
      { password: hashedpassword },
      { where: { id: userData.id } }
    );
  }
  return pass;
}

function getRandomString(length) {
  var randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

// return user from Email
async function getUser(email) {
  email = email.trim().toLowerCase();
  const getUser = await models.users
    .findOne({
      where: { email: email },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });

  return getUser;
}

async function updateUser(userId, name, password) {
  if (!userId || !name || !password) {
    throw new Error('Invalid or missing requirements');
  }
  const hashedpassword = await bcrypt.hash(password, 10);

  await models.users.update(
    { name: name, password: hashedpassword },
    { where: { id: userId } }
  );
}

module.exports = {
  insertUser,
  checkEmail,
  checkPassword,
  checkUser,
  getID,
  tempPass,
  getUser,
  updateUser,
  getRandomString,
};
