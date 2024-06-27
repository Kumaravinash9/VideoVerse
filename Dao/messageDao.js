const { db } = require("../Utils/dbConfig");

const fetchMessages = async (from, to) => {
  const messageDB = db
    .collection("messages")
    .where("from", "==", from)
    .where("to", "==", to)
    .orderBy("timestamp");
  return messageDB
    .get()
    .then((messageInfo) => {
      console.log(messageInfo);
      let messages = [];
      messageInfo.forEach((message) => {
        messages.push(message.data());
      });
      return messages;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
};

const doubleTickUpdate = async (uid) => {
  const messageDB = db
    .collection("messages")
    .where("to", "==", uid)
    .where("delivered", "==", false)
    .orderBy("timestamp", "desc");
  messageDB
    .get()
    .then((messageInfo) => {
      messageInfo.forEach((message) => {
        return db.collection("messages").doc(message.id).update({
          delivered: true,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const seenMessages = async (from, to) => {
  const messageDB = db
    .collection("messages")
    .where("from", "==", from)
    .where("to", "==", to)
    .where("seen", "==", false)
    .orderBy("timestamp", "desc");
  messageDB
    .get()
    .then((messageInfo) => {
      console.log(messageInfo);
      return messageInfo.forEach((message) => {
        db.collection("messages").doc(message.id).update({
          seen: true,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const createMessages = async (message) => {
  const timestamp = Date.now();
  const id = message.from + message.to + timestamp.toString();
  const messageJson = {
    from: message.from,
    to: message.to,
    timestamp: timestamp,
    seen: message.seen,
    delivered: message.delivered,
    id: id,
    doubletick: message.doubletick,
    message: message.text,
  };
  const messageDB = db.collection("messages");
  await messageDB
    .doc(id)
    .set(messageJson)
    .catch((error) => {
      console.log(error);
    });
};

module.exports = {
  fetchMessages,
  createMessages,
  seenMessages,
  doubleTickUpdate,
};
