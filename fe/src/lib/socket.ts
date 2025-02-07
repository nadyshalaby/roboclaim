import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth';
import { FileUploadResponse } from './api';

interface FileStatusData {
  fileId: string;
  status: FileUploadResponse['status'];
  data?: Record<string, unknown>;
}

type FileStatusCallback = (status: string, data?: Record<string, unknown>) => void;
type ErrorCallback = (error: Error) => void;
type ConnectCallback = () => void;
type SocketCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketCallback<FileStatusData>>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const { token, user } = useAuth.getState();
    if (!token || !user) return;

    this.socket = io(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
      auth: {
        token: `Bearer ${token}`,
        userId: user.id
      },
      withCredentials: true,
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('fileStatus', (data) => {
      const listeners = this.listeners.get('fileStatus');
      if (listeners) {
        listeners.forEach((listener) => listener(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  addListener(event: string, callback: SocketCallback<FileStatusData>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  removeListener(event: string, callback: SocketCallback<FileStatusData>) {
    this.listeners.get(event)?.delete(callback);
  }

  onFileStatus(_: FileStatusCallback): void {
    // ...
  }

  onError(_: ErrorCallback): void {
    // ...
  }

  onConnect(_: ConnectCallback): void {
    // ...
  }
}

export const socketService = new SocketService();
export default socketService;
