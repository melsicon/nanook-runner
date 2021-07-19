const fs = require("fs");
const path = require("path");

class Runner {
  constructor(tdgdir, services) {
    this.tdgdir = tdgdir;
    this.testcases = fs.readdirSync(tdgdir);
    this.services = services;
  }

  run() {
    this.testcases.forEach(async (testcase) => {
      const testcasePath = path.join(this.tdgdir, testcase, "runnerData.json");

      if (fs.existsSync(testcasePath)) {
        let data = fs.readFileSync(testcasePath);
        data = JSON.parse(data);

        this.services.forEach(async (service) => {
          await service(data)
            .then((response) => response.json())
            .then((d) => {
              console.log(testcase, d.message);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      }
    });
  }
}

module.exports.Runner = Runner;
