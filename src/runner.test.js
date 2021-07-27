const { Runner } = require("./runner");

describe("validate() returns correct boolean", () => {
  const responses = [
    {
      expectedResponse: '{ "message": "\\"email\\" is required" }',
      actualResponse: { message: '"email" is required' },
      expectedSuccess: true,
    },
    {
      expectedResponse: '{ "message": "\\"email\\" is required" }',
      actualResponse: { message: "User successfully registered." },
      expectedSuccess: false,
    },
  ];

  responses.forEach(({ expectedResponse, actualResponse, expectedSuccess }) => {
    test("actual response is expected response", () => {
      // Arrange
      const runner = new Runner();
      // Act
      const isSuccess = runner.validate(expectedResponse, actualResponse);
      // Assert
      expect(isSuccess).toEqual(expectedSuccess);
    });
  });
});
