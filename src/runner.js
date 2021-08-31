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

    const result = await this.getData();
    const validatedTestcases = this.checkStep(result);

    if (this.options.logger) console.log(validatedTestcases);
    if (this.options.report) {
      const reportData = this.generateReportData(validatedTestcases);
      this.generateReport(reportData);
    }
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

  getData() {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const data = await this.getStorageData();
        const testcases = await data.all();
        resolve(testcases);
      }, 1500);
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

  checkStep(data) {
    const validatedTestcases = data.map((testcase) => {
      const { response: actualResponse } = testcase.value;
      const { _expectedResponse: expectedResponse } = testcase.value.data;
      const isValid = this.validate(expectedResponse, actualResponse);

      return { ...testcase, isValid };
    });

    return validatedTestcases;
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
      console.log("data", d);
      if (d.isValid) countSuccess++;
      else countFailed++;
    });

    return { countSuccess, countFailed, data };
  }

  generateReport(data) {
    let dirpath = "./report.html";
    let stream = fs.createWriteStream(dirpath);

    stream.once("open", function () {
      let html = buildReport(data);

      stream.end(html);
    });
  }

  cleanup() {
    this.cleanupFunc();
  }
}

module.exports.Runner = Runner;
