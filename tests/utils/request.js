function request(data) {
  const response = Promise.resolve({
    ok: true,
    json: () => {
      return data ? data : {};
    },
  });

  return response;
}

module.exports.request = request;
