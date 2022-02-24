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
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (passwordCompare) {
      if (user.is_activated) {
        return { authenticated: true, verified: true };
      }
    }
    throw new Error('Invalid or missing requirements');
  }
};

module.exports = {
  insertUser,
  checkEmail,
  checkPassword,
  checkUser,
};
