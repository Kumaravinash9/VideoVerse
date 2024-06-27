const admin = require("firebase-admin");
const ApiError = require("../Utils/apiError");
const authUtils = require("../Utils/authUtils");

const createUser = async (email, password) => {
  const userRecord = await admin
    .auth()
    .createUser({
      email: email,
      password: password,
    })
    .catch((e) => {
      console.log(e);
    });
  const authToken = await generateAuthToken(userRecord.uid);
  return {
    authToken,
  };
};

const verifyAuthToken = async (req) => {
  let sessionCookie = "";
  console.log(req.rawHeaders[21]);
  if (
    req.rawHeaders.length > 21 &&
    req.rawHeaders[21].split("; ").length >= 3
  ) {
    req.rawHeaders[21].split("; ").forEach((element) => {
      if (element.search("session=") != -1)
        sessionCookie = element.substring(8);
    });
  }

  return admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */);
};

/**
 * @description Checking for the validity for the auth token
 * @param {*} token Auth token
 * @returns {Promise<user>}
 */
const validateAuthToken = async (token) =>
  new Promise((resolve, reject) => {
    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        resolve(decodedToken);
      })
      .catch((e) => {
        console.log(error);
        throw new ApiError("error in decoding token");
      });
  });

/**
 * @description This method is used for generating the Auth Token
 * @param {*} param0 Data object to be set on auth token
 * @returns {Promise<token>} A promise resolved for auth token
 */
const generateAuthToken = async (uid) =>
  new Promise((resolve, reject) => {
    admin
      .auth()
      .createCustomToken(uid)
      .then((customToken) => {
        resolve(customToken);
      })
      .catch((error) => {
        console.log(error);
        throw new ApiError("error in creating token");
      });
  });

module.exports = {
  createUser,
  verifyAuthToken,
  validateAuthToken,
};
