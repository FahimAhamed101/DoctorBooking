const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const socketIO = require("./utils/socketIO");

const host = process.env.HOST || "0.0.0.0";

let server;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");

  server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  socketIO(io);
  global.io = io;

  server.listen(config.port, host, () => {
    logger.info(`HTTP and Socket.IO server listening at http://${host}:${config.port}`);
  });
});

// Handle graceful shutdown and errors
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }
  process.exit(1);
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  exitHandler();
});
