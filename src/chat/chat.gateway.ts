import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { productId: string }
  ) {
    client.join(`product:${data.productId}`);
  }

  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() data: any) {
    this.server.to(`product:${data.productId}`).emit('new_message', data);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { productId: string, isTyping: boolean }
  ) {
    client.to(`product:${data.productId}`).emit('user_typing', {
      userId: client.id,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('get_online')
  handleGetOnline(@ConnectedSocket() client: Socket) {
    const room = Array.from(client.rooms)[1];
    if (room) {
      const sockets = this.server.in(room).fetchSockets();
      sockets.then((s) => {
        client.emit('online_users', { count: s.length });
      });
    }
  }
}
