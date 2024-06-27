const app = require("express").Router();
const admin = require("firebase-admin");
const { fetchMessages, seenMessages } = require("../Dao/messageDao");

app.get("/messages/:id", async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const to = req.params.id;
  if (to != "undefined") {
    return admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((userData) => {
        return fetchMessages(userData.uid, to).then(async (messages) => {
          await seenMessages(to, userData.uid);
          return { messages: messages, from: userData.uid };
        });
      })
      .then(({ messages, from }) => {
        return fetchMessages(to, from).then((messagesInfo) => {
          messages = messages.concat(messagesInfo);
          messages.sort(function (a, b) {
            return a.timestamp - b.timestamp;
          });
          return res.json(messages);
        });
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/login");
      });
  } else {
    return res.status(400).json("invalid parameters");
  }
});

module.exports = app;
