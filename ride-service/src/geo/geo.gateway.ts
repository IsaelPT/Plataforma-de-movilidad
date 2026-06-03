import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  namespace: '/geo',
  cors: { origin: '*', credentials: true },
  port: parseInt(process.env.WS_PORT || '3002', 10),
})
export class GeoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GeoGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const { userId, role } = client.handshake.query || {};
    if (!userId || !role || !['passenger', 'driver'].includes(role as string)) {
      client.disconnect();
      return;
    }
    client.join(`user:${userId}`);
    this.logger.log(`Geo client connected: ${role}:${userId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Geo client disconnected: ${client.id}`);
  }
}
