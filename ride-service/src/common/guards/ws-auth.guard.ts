import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const { userId, role } = client.handshake.query || {};

    if (!userId || !role) {
      this.logger.warn('WebSocket connection rejected: missing userId or role');
      throw new WsException('Authentication required: userId and role are required');
    }

    if (!['passenger', 'driver'].includes(role as string)) {
      throw new WsException('Invalid role. Must be passenger or driver');
    }

    client.data.userId = userId;
    client.data.role = role;

    return true;
  }
}
