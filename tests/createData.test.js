const mock = require("mock-fs");
const { Runner } = require("../src/runner");

describe("createData() generates correct data", () => {
  beforeAll(() => {
    mock({
      "tdg/TC1/runnerData.json":
        '{\r\n  "password": "password",\r\n  "confirmPassword": "password",\r\n  "_response": "{ \\"message\\": \\"User successfully registered.\\" }",\r\n  "email": "Ceylin.Kramer@gum.org",\r\n  "firstName": "Ceylin",\r\n  "lastName": "Kramer"\r\n}',
      "tdg/TC2/runnerData.json":
        '{\r\n  "password": "password",\r\n  "confirmPassword": "password",\r\n  "_response": "{ \\"message\\": \\"User successfully registered.\\" }",\r\n  "email": "Ceylin.Kramer@gum.org",\r\n  "firstName": "Ceylin",\r\n  "lastName": "Kramer"\r\n}',
    });
  });

  afterAll(() => {
    mock.restore();
  });

  test("correct data", () => {
    // Arrange
    const runner = new Runner("tdg");
    // Act
    runner.createData();
    // Assert
    expect(runner.testcaseData).toHaveLength(2);
  });
});
