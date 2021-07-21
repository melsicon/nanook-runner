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
    this.runValidation().then((data) => {
      if (this.options.report) this.generateReport(data);
    });
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

  runValidation() {
    return new Promise(async (resolve, reject) => {
      const testcaseDataWithRes = [];

      for (const testcase of this.testcaseData) {
        await this.service(testcase.data)
          .then((response) => response.json())
          .then((data) => {
            testcase.response = {
              success: data.success,
              message: data.message,
            };

            testcaseDataWithRes.push(testcase);

            if (this.options.logger) console.log(testcase);

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
