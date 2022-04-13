/* eslint-disable */
function validString(str) {
  if (!str || typeof str !== 'string' || !str.trim()) return false;
  return true;
}
function validStringEmpty(str) {
  if (typeof str !== 'string') return false;
  return true;
}

function validBoolean(bool) {
  if (typeof bool !== 'boolean') return false;
  return true;
}

function validEmail(email) {
  if (!validString(email)) return false;
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkIfValidUUID(str) {
  if (validString(str)) {
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    return regexExp.test(str);
  }
}

function checkIsProperNumber(val) {
  if (typeof val !== 'number') {
    return false;
  }

  if (isNaN(val)) {
    return false;
  }
  return true;
}

function validIsoDate(date) {
  return !isNaN(Date.parse(date));
}

module.exports = {
  validString,
  validEmail,
  validBoolean,
  checkIfValidUUID,
  checkIsProperNumber,
  validIsoDate,
  validStringEmpty,
};
