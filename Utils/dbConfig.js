const dbAdmin = require("firebase-admin");
const serviceAccount = require("../service.json");

const db = dbAdmin
  .initializeApp({
    credential: dbAdmin.credential.cert(serviceAccount),
  })
  .firestore();

module.exports = { db };
