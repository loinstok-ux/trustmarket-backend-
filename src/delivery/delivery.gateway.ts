import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'delivery' })
export class DeliveryGateway {
  @WebSocketServer()
  server: Server;

  // In-memory store simulating Redis: transactionId -> { buyer: { lat, lng }, seller: { lat, lng } }
  private locations: Record<string, { buyer?: { lat: number, lng: number }, seller?: { lat: number, lng: number } }> = {};

  @SubscribeMessage('update_location')
  handleLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { transactionId: string, lat: number, lng: number, role: 'buyer' | 'seller' }
  ) {
    const { transactionId, lat, lng, role } = payload;
    
    // Initialize transaction room if not exists
    if (!this.locations[transactionId]) {
      this.locations[transactionId] = {};
    }

    // Join room to receive alerts
    client.join(`delivery:${transactionId}`);

    // Update location
    this.locations[transactionId][role] = { lat, lng };

    // Check distance if both are present
    const locs = this.locations[transactionId];
    if (locs.buyer && locs.seller) {
      const distance = this.calculateDistance(locs.buyer, locs.seller);
      
      console.log(`[Delivery] Transacción ${transactionId}: Distancia entre usuarios = ${distance.toFixed(2)}m`);

      if (distance <= 10) {
        this.server.to(`delivery:${transactionId}`).emit('ready_to_deliver', { distance });
      }
    }
  }

  // Haversine formula
  private calculateDistance(
    loc1: { lat: number, lng: number }, 
    loc2: { lat: number, lng: number }
  ): number {
    const R = 6371e3; // metres
    const φ1 = loc1.lat * Math.PI/180; // φ, λ in radians
    const φ2 = loc2.lat * Math.PI/180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI/180;
    const Δλ = (loc2.lng - loc1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // in metres
    return distance;
  }
}
