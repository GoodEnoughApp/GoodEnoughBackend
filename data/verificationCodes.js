const models = require('../models/index');

// Insert a record
async function insertCode(code, userId) {
  await models.verification_codes
    .create({
      user_id: userId,
      code: code,
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });
}

async function checkCode(userId, code) {
  if (!userId || !code) {
    throw new Error('Invalid or missing requirements');
  }
  const userCode = await models.verification_codes.findOne({
    where: { user_id: userId, code: code },
  });
  if (userCode === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    await models.users.update(
      { is_activated: true },
      { where: { id: userId } }
    );
  }
}

// verification code
async function getCode(userId) {
  const getCode = await models.verification_codes
    .findOne({
      where: { user_id: userId },
    })
    .catch((err) => {
      throw `error: ${err.message}`;
    });

  return getCode.code;
}

module.exports = {
  insertCode,
  checkCode,
  getCode,
};
