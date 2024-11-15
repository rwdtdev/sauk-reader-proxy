import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🚀 ~ io.on ~ connection:");
});

io.on("error", (error) => {
  console.log("🚀 ~ io.on ~ error:");
  // ...
});

io.on("reconnect", (attempt) => {
  console.log("🚀 ~ io.on ~ reconnect:");
  // ...
});

httpServer.listen(8090, () => {
  console.log("io server on port 8090");
});
