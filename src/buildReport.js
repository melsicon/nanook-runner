const buildReport = ({ countSuccess, countFailed, data }) => {
  let header = "<title>Testcase Report</title>";
  let body = "<ul>";
  body += "<li>" + countSuccess + " Success Tests</li>";
  body += "<li>" + countFailed + " Failed Tests</li>";

  data.forEach(({ isValid, value }) => {
    body +=
      "<li>" +
      value.name +
      ": " +
      isValid +
      "<ul>" +
      "<li>" +
      "Expected response: " +
      value.data._expectedResponse +
      "</li>" +
      "<li>" +
      "Response: " +
      value.response.message +
      "</li>" +
      "</ul>" +
      "</li>";
  });

  body += "</ul>";

  return (
    "<!DOCTYPE html>" +
    "<html><head>" +
    header +
    "</head><body>" +
    body +
    "</body></html>"
  );
};

module.exports.buildReport = buildReport;
