const app = require("express").Router();
const admin = require("firebase-admin");
const { createUser, getOnlineUsers, fetchUsers } = require("../Dao/userDao");

app.get("/login", function (req, res) {
  res.render("login.html");
});

app.get("/signup", function (req, res) {
  res.render("signup.html");
});

app.get("/profile", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      res.render("chat.html");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/", function (req, res) {
  res.render("index.html");
});

app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken.toString();
  const name = req.body.name;
  const email = req.body.email;
  const uid = req.body.uid;

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        if (name != undefined || name != null) {
          createUser({ name, uid, email });
        }
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.get("/users/online", async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  return admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      return getOnlineUsers(userData.uid).then((userInfo) => {
        console.log(userInfo);
        return res.json(userInfo);
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});
module.exports = app;
