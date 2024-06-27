const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cat = require("cat-me");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const { WebSocketServer, WebSocket } = require("ws");
const { updateOnlineStatus } = require("./Dao/userDao");
const {
  doubleTickUpdate,
  seenMessages,
  createMessages,
} = require("./Dao/messageDao");
const messageRoutes = require("./Routes/message");

const userService = require("./Services/userService");
const userRoute = require("./Routes/user");
const { onSocketPostError, onSocketPreError } = require("./Utils/utils");
const app = express();
const clientInfo = new Map();
dotenv.config({
  path: "config.env",
});
const csrfMiddleware = csrf({ cookie: true });
app.use(cors());
app.use(cookieParser());
app.use(csrfMiddleware);

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.use(userRoute);
app.use(messageRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(cat());
});

const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", async (req, socket, head) => {
  socket.on("error", onSocketPreError);
  req.user = await userService.verifyAuthToken(req);

  wss.handleUpgrade(req, socket, head, (ws) => {
    socket.removeListener("error", onSocketPreError);
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", async (ws, req) => {
  ws.on("error", onSocketPostError);
  await updateOnlineStatus(req.user.uid, true);
  await doubleTickUpdate(req.user.uid);
  clientInfo.set(req.user.uid, ws);
  ws.on("message", (msg, isBinary) => {
    const seralizedMessage = JSON.parse(msg);
    wss.clients.forEach((client) => {
      const messageJson = {
        from: req.user.uid,
        to: seralizedMessage.to,
        seen: true,
        delivered: true,
        doubletick: true,
        text: seralizedMessage.text,
      };
      if (
        client.readyState === WebSocket.OPEN &&
        clientInfo.has(seralizedMessage.to) &&
        clientInfo.get(seralizedMessage.to) == client &&
        ws != client
      ) {
        client.send(msg, { binary: isBinary });
      } else if (!clientInfo.has(seralizedMessage.to)) {
        messageJson.seen = false;
        messageJson.seen = false;
      }
      createMessages(messageJson);
      seenMessages(seralizedMessage.to, req.user.uid);
    });
  });

  ws.on("close", () => {
    updateOnlineStatus(req.user.uid, false);
    clientInfo.delete(req.user.uid);
    console.log("Connection closed");
  });
});
