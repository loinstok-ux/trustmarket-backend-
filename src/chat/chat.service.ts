import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private messages: any[] = [];

  sendMessage(data: any) {
    const message = {
      id: Date.now(),
      ...data,
      sender: data.sender || 'Usuario',
      timestamp: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  getMessages(productId: string) {
    return this.messages.filter(m => m.productId === productId);
  }

  deleteMessage(id: number) {
    const index = this.messages.findIndex(m => m.id === id);
    if (index > -1) {
      this.messages.splice(index, 1);
      return { deleted: true };
    }
    return { deleted: false };
  }

  markAsRead(messageId: number) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      return message;
    }
    return null;
  }

  getUnreadCount(productId: string) {
    return this.messages.filter(m => 
      m.productId === productId && !m.read
    ).length;
  }
}
