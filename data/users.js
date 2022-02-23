const models = require('../models/index');

// function userNameValidation(username) {
//   const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
//   if (typeof username !== 'string') {
//     throw `Username is not of type string`;
//   }
//   if (username.trim() === '') {
//     throw `Please enter a username`;
//   }
//   if (username.length < 4) {
//     throw `Username must have 4 characters`;
//   }
//   if (!usernameRegex.test(username)) {
//     throw `Please use valid username format`;
//   }
// }

// function passwordValidation(password) {
//   const passwordRegex = /^\S{6,}$/;
//   if (!passwordRegex.test(password)) {
//     throw `Either the username or password is invalid`;
//   }
// }

// Insert a record
async function insertUser(name, email, password, is_activated) {
  await models.users
    .create({
      name: name,
      email: email.toLowerCase(),
      password: password,
      is_activated: is_activated,
    })
    .catch(function (err) {
      throw 'error: ' + err.message;
    });
}

// check if email exists - sign up
// true --> no record , false --> record exists
async function checkEmail(email) {
  var emails = await models.users
    .findAll({
      where: {
        email: email.toLowerCase(),
      },
    })
    .catch(function (err) {
      throw 'error: ' + err.message;
    });
  if (!emails.length) return true;
  else return false;
}

// check password length - Sign up
function checkPassword(Password) {
  if (Password.toString().length < 8) {
    return true;
  } else {
    return false;
  }
}

// sign in function
const checkUser = async (email, password) => {
  if (!email) {
    throw `Please provide email`;
  }
  if (!password) {
    throw `Please provide password`;
  }
  email = email.trim();
  //   valid.userNameValidation(username);
  //   valid.passwordValidation(password);
  const emailCheck = await models.users.findOne({
    where: { email: email.toLowerCase() },
  });
  if (emailCheck === null) {
    throw `Either the email or password is invalid`;
  } else {
    const passwordCompare = await bcrypt.compare(password, emailCheck.password);
    if (passwordCompare) {
      return { authenticated: true };
    } else {
      throw `Either the username or password is invalid`;
    }
  }
};

module.exports = {
  insertUser,
  checkEmail,
  checkPassword,
  checkUser,
};
