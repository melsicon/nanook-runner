const fs = require("fs");
const path = require("path");
const { fetchRegisterAPI } = require("../utils/fetchRegisterAPI");

class Runner {
  constructor(tdgdir) {
    this.tdgdir = tdgdir;
    this.testcases = fs.readdirSync(tdgdir);
  }

  run() {
    this.testcases.forEach(async (testcase) => {
      const personPath = path.join(this.tdgdir, testcase, "runnerData.json");

      if (fs.existsSync(personPath)) {
        const PersonData = fs.readFileSync(personPath);
        const person = JSON.parse(PersonData);

        await fetchRegisterAPI(person)
          .then((response) => response.json())
          .then((data) => {
            console.log(testcase, data.message);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
}

module.exports.Runner = Runner;
