const { request } = require("./utils/request");
const { Runner } = require("../src/runner");

const testcaseData = [
  {
    name: "TC1",
    data: {
      password: "password",
      confirmPassword: "password",
      _expectedResponse: '{ "message": "User successfully registered." }',
      email: "Hussein.Morhelfer@yahoo.com",
      firstName: "Hussein",
      lastName: "Morhelfer",
    },
  },
  {
    name: "TC2",
    data: {
      password: "password",
      confirmPassword: "password",
      _expectedResponse: '{ "message": "\\"email\\" is required" }',
      firstName: "Hugo",
      lastName: "Meloni",
    },
  },
];

test("actual response is expected response", () => {
  // Arrange
  const runner = new Runner();
  runner.service = request;
  runner.testcaseData = testcaseData;
  let validatedData = [];
  // Act
  runner
    .runValidation()
    .then((data) => {
      validatedData = data;
      console.log(data);
    })
    .catch((err) => console.log(err));
  // Assert
  expect(validatedData).toEqual(validatedData);
});
