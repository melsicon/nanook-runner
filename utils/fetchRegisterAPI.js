const fetch = require("node-fetch");

const fetchRegisterAPI = (data) => {
  const response = fetch("http://localhost:5000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

module.exports.fetchRegisterAPI = fetchRegisterAPI;
