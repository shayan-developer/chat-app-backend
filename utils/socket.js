import * as socket from "socket.io";
import User from "../models/user.js";
import Message from "../models/message.js";

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

export default function (server) {
  const io = new socket.Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("disconnect", async () => {
      if (socket.userId) {
        const user = await User.findById(socket.userId);
        user.status = "Offline";
        await user.save();
      }
      const members = await User.find();
      io.emit("new-user", members);
      console.log("Client disconnected", socket.id);
    });

    socket.on("new-user", async (userId) => {
      const members = await User.find();
      const user = await User.findById(userId);
      user.status = "Online";
      await user.save();
      socket.userId = userId;
      // io.to.emit("new-user", members);
      io.emit("new-user", members);
    });

    socket.on("join-room", async (newRoom, previousRoom) => {
      socket.join(newRoom);
      socket.leave(previousRoom);
      let roomMessages = await getLastMessagesFromRoom(newRoom);
      roomMessages = sortRoomMessagesByDate(roomMessages);
      socket.emit("room-messages", roomMessages);
    });

    socket.on("message-room", async (room, content, sender, time, date) => {
      const newMessage = await Message.create({
        content,
        from: sender,
        time,
        date,
        to: room,
      });
      let roomMessages = await getLastMessagesFromRoom(room);
      roomMessages = sortRoomMessagesByDate(roomMessages);
      // sending message to room
      io.to(room).emit("room-messages", roomMessages);
      socket.broadcast.emit("notifications", room);
    });

    socket.on("logout", async (userId) => {
      const user = await User.findById(userId);
      user.status = "Offline";
      await user.save();
      const members = await User.find();
      io.emit("new-user", members);
    });
  });
}
