// References:
// https://github.com/mohamedlotfe/unit-testing-api-nodejs-jest
// https://stackoverflow.com/questions/47718503/typeerror-app-address-is-not-a-function

require('dotenv').config();
const app = require('../app');
const supertest = require("supertest");

//  Tests cannot be nested. Test "/login" cannot run because it is nested within "update pass and name".
// in Unit testing, tests should be independent
test('update pass and name', async () => {
  let loginToken = process.env.Usertoken;
  const data = {password: process.env.UserPassword, name:process.env.UserName };

const response = await supertest(app)
                 .put('/me') 
                 .set('authorization', `Bearer ${loginToken}`).send(data)
 expect(response.status).toEqual(200);
});


test("/register", async () => {
  const data = { email: process.env.UserEmail, password: process.env.UserPassword, name:process.env.UserName };
  await supertest(app).post("/register")
    .send(data)
    .expect(409)
});

test("/register/verify", async () => {
  const data = { email: process.env.UserEmail , verificationCode: process.env.UserCode };
  await supertest(app).post("/register/verify")
    .send(data)
    .expect(201)
});

test("/forgot", async () => {
  const data = {};
  await supertest(app).post("/forgot")
    .send(data)
    .expect(422)
});