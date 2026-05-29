import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// connection
socket.on("connect", () => {
  console.log("Client 1 connected:", socket.id);

  // join document room
  const documentId = "doc123";
  socket.emit("join-document", documentId);

  console.log("Joined document:", documentId);

  // send update after 2 seconds
  setTimeout(() => {
    const payload = {
      documentId,
      content: "Hello from Client 1 👋",
    };

    console.log("Client 1 sending update:", payload);

    socket.emit("send-changes", payload);
  }, 2000);
});

// optional: receive updates (if backend broadcasts)
socket.on("receive-changes", (data) => {
  console.log("🔥 Client 1 received update:", data);
});