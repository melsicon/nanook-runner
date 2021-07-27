const { Runner } = require("../src/runner");

describe("check if returns correct report data", () => {
  const testcaseData = [
    {
      data: [
        {
          name: "TC1",
          data: {},
          response: {},
          success: true,
        },
        {
          name: "TC2",
          data: {},
          response: {},
          success: true,
        },
      ],
      expectedCountSuccess: 2,
      expectedCountFailed: 0,
    },
    {
      data: [
        {
          name: "TC1",
          data: {},
          response: {},
          success: true,
        },
        {
          name: "TC2",
          data: {},
          response: {},
          success: false,
        },
      ],
      expectedCountSuccess: 1,
      expectedCountFailed: 1,
    },
  ];

  testcaseData.forEach(
    ({ data, expectedCountSuccess, expectedCountFailed }) => {
      test("countSuccess/countFailed is expected countSuccess/countFailed", () => {
        // Arrange
        const runner = new Runner();
        // Act
        const reportData = runner.generateReportData(data);
        // Assert
        expect(reportData.countSuccess).toBe(expectedCountSuccess);
        expect(reportData.countFailed).toBe(expectedCountFailed);
      });
    }
  );
});
