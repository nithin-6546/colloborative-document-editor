import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

/* ---------------- SOCKET AUTH MIDDLEWARE ---------------- */
export const socketAuth = (socket, next) => {
  try {
    // token sent from frontend via io({ auth: { token } }) or from cookies
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(";").reduce((acc, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies.token;
    }

    if (!token) {
      return next(new Error("Authentication failed: No token provided"));
    }

    // verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // attach user info to socket
    socket.user = decoded;

    next();
  } catch (err) {
    return next(new Error("Authentication failed: Invalid or expired token"));
  }
};