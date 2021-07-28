function request() {
  const response = Promise.resolve({
    ok: true,
    json: () => {
      return { message: "test" };
    },
  });

  return response;
}

module.exports.request = request;
