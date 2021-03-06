const models = require('../models/index');

// Insert a record
async function insertCode(code, userId) {
  await models.verification_code
    .create({
      user_id: userId,
      code,
    })
    .catch((err) => {
      throw err;
    });
}

async function checkCode(userId, code) {
  if (!userId || !code) {
    throw new Error('Invalid or missing requirements');
  }
  const userCode = await models.verification_code.findOne({
    where: { user_id: userId, code },
  });
  if (userCode === null) {
    throw new Error('Invalid or missing requirements');
  } else {
    await models.user.update({ is_activated: true }, { where: { id: userId } });
  }
}

// verification code
async function getCode(userId) {
  const getUserCode = await models.verification_code
    .findOne({
      where: { user_id: userId },
    })
    .catch((err) => {
      throw err;
    });

  return getUserCode.code;
}

module.exports = {
  insertCode,
  checkCode,
  getCode,
};
