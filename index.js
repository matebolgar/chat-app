const express = require("express");
const path = require("path");
const app = express();

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/kliens-app.js", (req, res) => res.sendFile(path.join(__dirname, "kliens-app.js")));
app.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, "style.css")));

const server = require("http").createServer(app);
server.listen(3000);

const io = require("socket.io")(server);
io.on("connect", handleConnection);

// state
let messages = [];
let participants = {}


function handleConnection(socket) {

    socket.on("disconnect", () => {
        delete participants[socket.id];
        io.emit("userListaMegvaltozott", Object.values(participants));
      });

    socket.on("nicknameMegadva", (payload) => {
        participants[socket.id] = payload.nickname
        io.emit("userListaMegvaltozott", Object.values(participants));
        socket.emit("bejelentkezesSikeres", {
            id: socket.id,
            messages: messages,
            participants: Object.values(participants),
        });

        socket.on("ujUzenet", (payload) => {
            messages.push({
              id: socket.id,
              timestamp: Date.now(),
              content: payload.message,
              nickname: participants[socket.id],
            });

            io.emit("uzenetekMegvaltoztak", { messages: messages });

            console.log(messages);
          });
    });

}