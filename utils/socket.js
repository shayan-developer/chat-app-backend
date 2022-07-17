import * as socket from "socket.io";

export default function (server) {
  const io = new socket.Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected",socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected",socket.id);
    });
  });
}
