import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// connection
socket.on("connect", () => {
  console.log("Client 2 connected:", socket.id);

  // join same document
  const documentId = "doc123";
  socket.emit("join-document", documentId);

  console.log("Client 2 joined document:", documentId);
});

// listen for updates from Client 1
socket.on("receive-changes", (data) => {
  console.log("🔥 Client 2 received update:", data);
});