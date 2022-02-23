const models = require('../models/index');

// Insert a record
async function insertUser(name, email, password, is_activated) {
    await models.users
        .create({
            name: name,
            email: email,
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
                email: email,
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

module.exports = {
    insertUser,
    checkEmail,
    checkPassword,
};
