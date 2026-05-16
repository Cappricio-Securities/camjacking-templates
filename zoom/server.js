const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", socket => {

  socket.on("join-room", roomId => {
    socket.join(roomId);

    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("offer", data => {
      socket.to(data.to).emit("offer", {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on("answer", data => {
      socket.to(data.to).emit("answer", {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on("ice-candidate", data => {
      socket.to(data.to).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id
      });
    });

    socket.on("send-message", msg => {
      io.to(roomId).emit("receive-message", msg);
    });

  });

});

http.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});