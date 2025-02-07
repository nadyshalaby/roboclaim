import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../auth/guards/ws-jwt-auth.guard';
import { FileStatus } from '../entities/file.entity';

interface FileStatusData {
  fileId: string;
  status: FileStatus;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface SocketUser {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: 'files',
  transports: ['websocket'],
})
@UseGuards(WsJwtAuthGuard)
export class FileGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FileGateway.name);

  private userSockets: Map<string, string[]> = new Map();

  handleConnection(client: Socket & { handshake: { auth: SocketUser } }) {
    const userId = client.handshake.auth.userId;
    if (!userId) {
      this.logger.warn(
        `Client ${client.id} attempted connection without userId`,
      );
      client.disconnect();
      return;
    }

    try {
      const userSocketIds = this.userSockets.get(userId) || [];
      userSocketIds.push(client.id);
      this.userSockets.set(userId, userSocketIds);
      this.logger.debug(`Client ${client.id} connected for user ${userId}`);

      // Send initial connection status
      client.emit('connected', { status: 'connected' });
    } catch (error) {
      this.logger.error(
        `Error handling connection for client ${client.id}:`,
        error,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket & { handshake: { auth: SocketUser } }) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      const userSocketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = userSocketIds.filter((id) => id !== client.id);
      if (updatedSocketIds.length > 0) {
        this.userSockets.set(userId, updatedSocketIds);
      } else {
        this.userSockets.delete(userId);
      }
    }
  }

  notifyFileStatus(
    userId: string,
    fileId: string,
    status: FileStatus,
    data?: Record<string, unknown>,
  ) {
    try {
      const userSocketIds = this.userSockets.get(userId);
      if (!userSocketIds?.length) {
        this.logger.debug(`No active connections for user ${userId}`);
        return;
      }

      const payload: FileStatusData = {
        fileId,
        status,
        data,
        timestamp: new Date().toISOString(),
      };

      userSocketIds.forEach((socketId) => {
        this.server.to(socketId).emit('fileStatus', payload);
      });
    } catch (error) {
      this.logger.error(
        `Error notifying file status for user ${userId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
