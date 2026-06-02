import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../common/guards/ws-auth.guard';
import { RideService } from './ride.service';
import { DriverService } from '../driver/driver.service';

@Injectable()
@WebSocketGateway({
  namespace: '/rides',
  cors: { origin: '*', credentials: true },
  port: parseInt(process.env.WS_PORT || '3002', 10),
})
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RideGateway.name);

  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { socketId: string; role: string; userId: string }> = new Map();

  constructor(
    private readonly rideService: RideService,
    private readonly driverService: DriverService,
  ) {}

  handleConnection(client: Socket) {
    const { userId, role } = client.handshake.query || {};
    if (!userId || !role || !['passenger', 'driver'].includes(role as string)) {
      client.disconnect();
      return;
    }
    this.connectedClients.set(client.id, {
      socketId: client.id,
      role: role as string,
      userId: userId as string,
    });
    client.join(`user:${userId}`);
    client.join(role === 'driver' ? 'drivers' : 'passengers');
    this.logger.log(`Client connected: ${role}:${userId}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToAllDrivers(event: string, data: any) {
    this.server.to('drivers').emit(event, data);
  }

  sendToAllPassengers(event: string, data: any) {
    this.server.to('passengers').emit(event, data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendToDriver(driverId: string, event: string, data: any) {
    this.server.to(`user:${driverId}`).emit(event, data);
  }

  sendToPassenger(passengerId: string, event: string, data: any) {
    this.server.to(`user:${passengerId}`).emit(event, data);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('accept_ride')
  async handleAcceptRide(client: Socket, payload: { rideId: string; driverId: string }) {
    try {
      const ride = await this.rideService.acceptRide(payload.rideId, payload.driverId);
      return { success: true, ride };
    } catch (error) {
      this.logger.error(`Accept ride failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('reject_ride')
  async handleRejectRide(client: Socket, payload: { rideId: string; driverId: string }) {
    try {
      await this.rideService.rejectOffer(payload.rideId, payload.driverId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('change_ride_status')
  async handleChangeStatus(client: Socket, payload: { rideId: string; status: string }) {
    try {
      const ride = await this.rideService.updateRideStatus(payload.rideId, payload.status);
      return { success: true, ride };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('cancel_ride')
  async handleCancelRide(
    client: Socket,
    payload: { rideId: string; userId: string; role: string; reasonCode?: string; notes?: string },
  ) {
    try {
      const result = await this.rideService.cancelRide(
        payload.rideId,
        payload.userId,
        payload.role,
        payload.reasonCode,
        payload.notes,
      );
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('update_location')
  async handleLocationUpdate(client: Socket, payload: { driverId: string; lat: number; lng: number }) {
    try {
      await this.driverService.updateLocation(payload.driverId, payload.lat, payload.lng);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
