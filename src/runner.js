const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { buildReport } = require("./buildReport");

class Runner {
  constructor(tdgdir, service, callStorage, cleanupFunc, options) {
    this.tdgdir = tdgdir;
    this.service = service;
    this.callStorage = callStorage;
    this.cleanupFunc = cleanupFunc;
    this.options = options;

    this.testcaseData = [];
  }

  async run() {
    this.createData();
    this.runService()
      .then((data) => {
        const validatedData = this.runValidation(data);
        if (this.options.logger) console.log(validatedData);
        if (this.options.report) {
          const reportData = this.generateReportData(validatedData);
          this.generateReport(reportData);
        }
      })
      .catch((err) => console.log(err.message));
  }

  createData() {
    const testcases = fs.readdirSync(this.tdgdir);

    testcases.forEach((testcase) => {
      const testcasePath = path.join(this.tdgdir, testcase, "runnerData.json");

      if (fs.existsSync(testcasePath)) {
        let data = fs.readFileSync(testcasePath);
        data = JSON.parse(data);

        this.testcaseData.push({ name: testcase, data });
      }
    });
  }

  runService() {
    return new Promise(async (resolve, reject) => {
      const testcaseDataWithRes = [];

      for (const testcase of this.testcaseData) {
        await this.service(testcase.data)
          .then((response) => response.json())
          .then((data) => {
            testcase.response = data;

            testcaseDataWithRes.push(testcase);

            if (this.callStorage != null) {
              this.callStorage(testcase);
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
      resolve(testcaseDataWithRes);
    });
  }

  runValidation(data) {
    return data.map((d) => {
      const expectedResponse = JSON.parse(d.data._response);
      const actualResponse = JSON.parse(JSON.stringify(d.response));
      const isSuccess = _.isEqual(expectedResponse, actualResponse);

      return { ...d, success: isSuccess };
    });
  }

  generateReportData(data) {
    let countSuccess = 0,
      countFailed = 0;

    data.forEach((d) => {
      if (d.success) countSuccess++;
      else countFailed++;
    });

    return { countSuccess, countFailed, data };
  }

  generateReport(data) {
    let dirpath = "./report.html";
    let stream = fs.createWriteStream(dirpath);

    stream.once("open", function (fd) {
      let html = buildReport(data);

      stream.end(html);
    });
  }

  cleanup() {
    this.cleanupFunc();
  }
}

module.exports.Runner = Runner;
