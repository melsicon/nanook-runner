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
    getStorageData,
    cleanupFunc,
    options
  ) {
    this.tdgdir = tdgdir;
    this.service = service;
    this.kafkaProducer = kafkaProducer;
    this.callStorage = callStorage;
    this.getStorageData = getStorageData;
    this.cleanupFunc = cleanupFunc;
    this.options = options;

    this.testcaseData = [];
  }

  async run() {
    this.createData();

    await this.registerStep().then((data) => {
      for (let testcase of data) {
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
    });

    await this.checkStep().then((data) => {
      if (this.options.logger) console.log(data);
      if (this.callStorage != null) {
        for (const testcase of data) {
          this.callStorage(testcase);
        }
      }
      if (this.options.report) {
        this.generateReport(data.value);
      }
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

  registerStep() {
    return new Promise(async (resolve, reject) => {
      const testcaseDataWithRes = [];

      for (const testcase of this.testcaseData) {
        // exclude _response when sending to service
        // eslint-disable-next-line no-unused-vars
        const { _expectedResponse, ...tData } = testcase.data;
        await this.service(tData)
          .then((response) => response.json())
          .then((data) => {
            testcase.response = data;
            testcaseDataWithRes.push(testcase);
          })
          .catch((err) => {
            reject(err);
          });
      }
      resolve(testcaseDataWithRes);
    });
  }

  async checkStep() {
    return new Promise(async (resolve) => {
      const testcaseDataWithRes = [];

      const testcases = await this.getStorageData();
      for await (const testcase of testcases) {
        const isValid = this.validate(
          testcase.value.data._expectedResponse,
          testcase.value.response
        );
        testcase.valid = isValid;
        testcaseDataWithRes.push(testcase);
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
