const fs = require("fs");
const path = require("path");

class Runner {
  constructor(tdgdir, services, callStorage, disposeFunc) {
    this.tdgdir = tdgdir;
    this.testcases = fs.readdirSync(tdgdir);
    this.services = services;
    this.callStorage = callStorage;
    this.disposeFunc = disposeFunc;

    this.testcaseData = [];
  }

  createData() {
    this.testcases.forEach(async (testcase) => {
      const testcasePath = path.join(this.tdgdir, testcase, "runnerData.json");

      if (fs.existsSync(testcasePath)) {
        let data = fs.readFileSync(testcasePath);
        data = JSON.parse(data);

        this.testcaseData.push({ name: testcase, data });
      }
    });
  }

  runServices() {
    this.testcaseData.forEach(async (testcase) => {
      this.services.forEach(async (service) => {
        await service(testcase.data)
          .then((response) => response.json())
          .then((data) => {
            testcase.responses = { [service.name]: data.message };
            console.log(testcase);

            if (this.callStorage != null) {
              this.callStorage(testcase);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  }

  dispose() {
    this.disposeFunc();
  }
}

module.exports.Runner = Runner;
