const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");

const myIp = process.env.BACKEND_IP;

let expressServer;
let socketServer;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");

  // Start Express server on main port
  expressServer = app.listen(config.port, myIp, () => {
    logger.info(`Express server listening at http://${myIp}:${config.port}`);
  });

  // Create proper HTTP server for Socket.IO
  socketServer = http.createServer();

  // Attach Socket.IO to socket server
  const { Server } = require("socket.io");
  const socketIO = require("./utils/socketIO");

  const io = new Server(socketServer, {
    cors: {
      origin: "*", // Allow all (you can restrict in prod)
      methods: ["GET", "POST"],
    },
  });

  // Setup your Socket.IO handlers
  socketIO(io);

  // Make it global if needed
  global.io = io;

  // Start the Socket.IO server on a different port
  socketServer.listen(config.soket_port, myIp, () => {
    logger.info(`Socket.IO server listening at http://${myIp}:${config.soket_port}`);
  });
});

// Handle graceful shutdown and errors
const exitHandler = () => {
  if (expressServer) {
    expressServer.close(() => {
      logger.info("Express server closed");
    });
  }
  if (socketServer) {
    socketServer.close(() => {
      logger.info("Socket.IO server closed");
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
