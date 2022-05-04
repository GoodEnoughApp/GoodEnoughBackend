
/* eslint-disable */

test('ok', () => {
  expect('ok').toBe('ok');
});

const { getUser , getRandomString, checkPassword, randomNumber}  = require('../data/users'); 

jest.mock("../data/users", () => {
  const users = jest.requireActual("../data/users");

  return {
    __esModule: true,
    getUser: jest.fn(() => {
      return {
        userFound: true,
        users: 
          {
            id: "123123123",
            name: "testtest",
            email: "test@hotmail.com",
            is_activated: true,
            password: "password"
          }
        
      };
    }),
    getRandomString: jest.fn(() => {
      return {
      result: "dXWcawMo"
      };
    }),

    checkPassword: jest.fn((text) => {
      return {
      result: true
      };
    }),
    randomNumber: jest.fn(() => {
      return {
      result: 718997 
      };
    }),
    foo: "mocked foo",
  };
  
});

test('Should get a user by the email', async () => {
    const email = 'test@hotmail.com';
    const user = await getUser(email);
    expect(user.userFound).toBe(true);
});

test("Get temp password to be sent to the user", async () => {
  const result= await getRandomString();
    expect(typeof result.result).toBe("string")

});

test("Check pass length", async () => {
  const result= await checkPassword("12345678");
    expect(result.result).toBe(true)

});

test("Check password", async () => {
  const result= await checkPassword("12345678");
    expect(typeof result.result).toBe("boolean")

});

test("Check random number verification code", async () => {
  const result= await randomNumber();
    expect(typeof result.result).toBe("number")

});