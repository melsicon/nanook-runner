/* eslint-disable no-async-promise-executor */
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { buildReport } = require("./buildReport");

class Runner {
  constructor(
    tdgdir,
    service,
    kafkaProducer,
    callStorage,
    cleanupFunc,
    options
  ) {
    this.tdgdir = tdgdir;
    this.service = service;
    this.kafkaProducer = kafkaProducer;
    this.callStorage = callStorage;
    this.cleanupFunc = cleanupFunc;
    this.options = options;

    this.testcaseData = [];
  }

  async run() {
    this.createData();
    this.registerStep();
    /* await this.runValidation()
      .then((data) => {
        if (this.options.logger) console.log(data);
        if (this.callStorage != null) {
          for (const testcase of data) {
            this.callStorage(testcase);
          }
        }
        if (this.options.report) {
          this.generateReport(data);
        }
      })
      .catch((err) => console.log(err.message)); */
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

  registerStep() {
    for (let testcase of this.testcaseData) {
      testcase = JSON.stringify(testcase);
      const payloads = [
        {
          topic: "input-topic",
          messages: [testcase],
        },
      ];

      this.kafkaProducer.send(payloads, (err, data) => {
        if (err) console.log(err);
        console.log(data);
      });

      this.kafkaProducer.on("error", (err) => {
        console.log(err);
      });
    }
  }

  runValidation() {
    return new Promise(async (resolve, reject) => {
      const testcaseDataWithRes = [];

      for (const testcase of this.testcaseData) {
        // exclude _response when sending to service
        const { _expectedResponse, ...tData } = testcase.data;
        await this.service(tData)
          .then((response) => response.json())
          .then((data) => {
            testcase.response = data;

            const success = this.validate(_expectedResponse, data);

            testcase.success = success;

            testcaseDataWithRes.push(testcase);
          })
          .catch((err) => {
            reject(err);
          });
      }
      resolve(testcaseDataWithRes);
    });
  }

  validate(expectedResponse, actualResponse) {
    expectedResponse = JSON.parse(expectedResponse);
    actualResponse = JSON.parse(JSON.stringify(actualResponse));
    const isSuccess = _.isEqual(expectedResponse, actualResponse);

    return isSuccess;
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
    const reportData = this.generateReportData(data);

    stream.once("open", function () {
      let html = buildReport(reportData);

      stream.end(html);
    });
  }

  cleanup() {
    this.cleanupFunc();
  }
}

module.exports.Runner = Runner;
