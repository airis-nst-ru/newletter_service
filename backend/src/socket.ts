import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

/**
 * Initialise Socket.IO on the given HTTP server.
 * Call this once from server.ts after app.listen().
 */
export const initSocket = (httpServer: HttpServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[socket] client connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`[socket] client disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Get the current Socket.IO instance.
 * Returns null if initSocket() has not been called yet.
 */
export const getIO = (): SocketIOServer | null => io;
