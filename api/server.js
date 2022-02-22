//require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const user_data = require("../data/users");
app.use(express.json())

app.post('/register', async(req,res) =>
{
  if (!req.body.name || !req.body.password || !req.body.email  )
  {
    res.status(422).json({
      "status": "error",
      "message": "Missing required values",
      "code": "ERROR_MISSING_REQUIRED_VALUES"
    });
  }
  if ( user_data.check_pass(req.body.password))
{
  res.status(422).json({
    "status": "error",
    "message": "Password less than 8 char.",
    "code": "ERROR_MISSING_REQUIRED_VALUES"
  });
}
const user = { name: req.body.name, password: req.body.password, email: req.body.email}
try
{
  var check_duplication = await user_data.check_email (user.email)
if(check_duplication)
{
  const hashedpassword = await bcrypt.hash(user.password, 10)
  await user_data.insert_user (user.name , user.email, hashedpassword , false);
  res.status(201).json({
    "status": "success",
    "message": "Success",
    "code": "Success"
  });
}
else
{
  res.status(409).json({
    "status": "error",
    "message": "The email already exist",
    "code": "ERROR_EMAIL_EXIST"
  });
}
}
catch (e)
{
  res.status(500).json({
      "status": "error",
      "message": "Server error",
      "code": "ERROR_SERVER"
    
  });
}

});

app.listen(3000)