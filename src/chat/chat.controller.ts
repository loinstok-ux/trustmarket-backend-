import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Enviar mensaje de chat' })
  sendMessage(@Body() data: any) {
    return this.chatService.sendMessage(data);
  }

  @Get('messages/:productId')
  @ApiOperation({ summary: 'Obtener mensajes de un producto' })
  getMessages(@Param('productId') productId: string) {
    return this.chatService.getMessages(productId);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  markAsRead(@Body() data: any) {
    return this.chatService.markAsRead(data.messageId);
  }
}
