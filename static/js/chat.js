document.addEventListener("DOMContentLoaded", function () {
  fetch("/users/online", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("network Issue");
      }
      return response.json();
    })
    .then((onlineUsers) => {
      const people = document.querySelector(".people");
      const chatDiv = document.querySelector(".chats");
      onlineUsers.forEach((user) => {
        const newNameSpan = document.createElement("span");
        newNameSpan.classList.add("name");
        const newChat = document.createElement("div");
        newChat.className = "chat";
        newChat.setAttribute("data-chat", user.uid);
        newNameSpan.textContent = user.name;
        const newPerson = document.createElement("li");
        newPerson.appendChild(newNameSpan);
        newPerson.classList.add("person");
        newPerson.setAttribute("data-chat", user.uid);
        people.appendChild(newPerson);
        chatDiv.appendChild(newChat);
      });
      document.querySelector(".person").classList.add("active");
      document.querySelector(".chat").classList.add("active-chat");
      let friends = {
          list: document.querySelector("ul.people"),
          all: document.querySelectorAll(".left .person"),
          name: "",
        },
        chat = {
          container: document.querySelector(".container .right .chats"),
          current: null,
          person: null,
          name: document.querySelector(".container .right .top .name"),
        };

      friends.all.forEach((f) => {
        f.addEventListener("mousedown", () => {
          setAciveChat(f);
          setMessageData(f);
        });
      });
      function setMessageData(f) {
        fetch("/messages/" + f.getAttribute("data-chat"), {
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.log("something wrong happened!");
            }
            return response.json();
          })
          .then((messages) => {
            let to_uid = f.getAttribute("data-chat");
            const chats = document.querySelector(".chats");
            messages.forEach((message) => {
              const newDivElement = document.createElement("div");
              const chatDiv = document.querySelector(
                ".chat[data-chat=" + to_uid + "]"
              );
              if (message.to == to_uid) {
                console.log("me");
                newDivElement.classList.add("bubble");
                newDivElement.classList.add("me");
                if (message.seen) {
                  newDivElement.style.backgroundColor = "green";
                } else if (message.delivered) {
                  newDivElement.style.backgroundColor = "grey";
                }
              } else {
                console.log("you");
                newDivElement.classList.add("bubble");
                newDivElement.classList.add("you");
              }
              newDivElement.textContent = message.message;
              chatDiv.appendChild(newDivElement);
              chats.appendChild(chatDiv);
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }

      function setAciveChat(f) {
        friends.list.querySelector(".active").classList.remove("active");
        f.classList.add("active");
        chat.current = chat.container.querySelector(".active-chat");
        chat.person = f.getAttribute("data-chat");
        chat.current.classList.remove("active-chat");
        chat.container
          .querySelector('[data-chat="' + chat.person + '"]')
          .classList.add("active-chat");
        friends.name = f.querySelector(".name").innerText;
        chat.name.innerHTML = friends.name;
      }
    })
    .catch((error) => {
      console.log(error);
    });
  (function () {
    let ws;
    const messages = document.getElementById("messages");
    const wsSend = document.getElementById("ws-send");
    const wsInput = document.getElementById("ws-input");

    function showMessage(message) {
      if (!messages) {
        return;
      }
      console.log(message);
    }

    function closeConnection() {
      if (!!ws) {
        ws.close();
      }
    }

    closeConnection();

    ws = new WebSocket("ws://localhost:3000");

    ws.addEventListener("error", () => {
      showMessage("WebSocket error");
    });

    ws.addEventListener("open", () => {
      showMessage("WebSocket connection established");
    });

    ws.addEventListener("close", () => {
      showMessage("WebSocket connection closed");
    });

    ws.addEventListener("message", (msg) => {
      console.log(msg.data);
      const chat = document.querySelector(".chats .active-chat");
      const newDivElement = document.createElement("div");
      newDivElement.classList.add("bubble");
      newDivElement.classList.add("you");
      chat.appendChild(newDivElement);
      newDivElement.innerHTML = JSON.parse(msg.data).text;
      ws.send(val);
      showMessage(`Received message: ${msg.data}`);
    });

    wsSend.addEventListener("click", () => {
      const val = wsInput?.value;

      if (!val) {
        return;
      } else if (!ws) {
        showMessage("No WebSocket connection");
        return;
      }
      const uid = document.querySelector(".active").getAttribute("data-chat");
      const chat = document.querySelector(".chats .active-chat");
      const newDivElement = document.createElement("div");
      newDivElement.classList.add("bubble");
      newDivElement.classList.add("me");
      newDivElement.innerHTML = val;
      newDivElement.style.backgroundColor = "green";
      chat.appendChild(newDivElement);
      const message = {
        to: uid,
        text: val,
      };
      ws.send(JSON.stringify(message));
      showMessage(`Sent "${val}"`);
      wsInput.value = "";
    });
  })();
});
