const { request } = require("./utils/request");
const { Runner } = require("../src/runner");

const testcaseData = [
  {
    name: "TC1",
    data: {
      password: "password",
      confirmPassword: "password",
      _expectedResponse: '{ "message": "test" }',
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
      _expectedResponse: '{ "message": "test" }',
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
      // Assert
      expect(validatedData[0].response).toEqual({ message: "test" });
      expect(validatedData[0].success).toEqual(true);
    })
    .catch((err) => console.log(err));
});
