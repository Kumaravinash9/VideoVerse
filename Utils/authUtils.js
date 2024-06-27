const ApiError = require("./apiError");

/**
 * @description Extract the token from the request
 * @param {headers} param0 Request headers
 * @returns {*} auth token
 */
const getToken = ({ headers }) => {
  const { authorization = "" } = headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer === "Bearer" && token) {
    return token;
  } else {
    throw new ApiError();
  }
};

module.exports = {
  getToken,
};
