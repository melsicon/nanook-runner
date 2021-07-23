const buildReport = ({ countSuccess, countFailed, data }) => {
  let header = "<title>Testcase Report</title>";
  let body = "<ul>";
  body += "<li>" + countSuccess + " Success Tests</li>";
  body += "<li>" + countFailed + " Failed Tests</li>";

  data.forEach(({ name, response }) => {
    body +=
      "<li>" +
      name +
      "<ul>" +
      "<li>" +
      response.message +
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