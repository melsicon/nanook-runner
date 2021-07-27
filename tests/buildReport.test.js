const { buildReport } = require("../src/buildReport");

describe("generates correct html", () => {
  const expectedHTML =
    '<!DOCTYPE html><html><head><title>Testcase Report</title></head><body><ul><li>2 Success Tests</li><li>0 Failed Tests</li><li>TC1<ul><li>User successfully registered.</li></ul></li><li>TC2<ul><li>"email" is required</li></ul></li></ul></body></html>';

  test("actual response is expected response", () => {
    // Arrange
    const reportData = {
      data: [
        {
          name: "TC1",
          data: {
            password: "password",
            confirmPassword: "password",
            _expectedResponse: '{ "message": "User successfully registered." }',
            email: "Andrea.Lukoschek@gum.org",
            firstName: "Andrea",
            lastName: "Lukoschek",
          },
          response: { message: "User successfully registered." },
          success: true,
        },
        {
          name: "TC2",
          data: {
            password: "password",
            confirmPassword: "password",
            _expectedResponse: '{ "message": "\\"email\\" is required" }',
            firstName: "Cosima",
            lastName: "Liebold",
          },
          response: { message: '"email" is required' },
          success: true,
        },
      ],
      countSuccess: 2,
      countFailed: 0,
    };
    // Act
    const html = buildReport(reportData);
    // Assert
    expect(html).toEqual(expectedHTML);
  });
});
