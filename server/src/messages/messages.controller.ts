import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @Body() body: { senderId: number; recipientId: number; content: string },
  ) {
    return this.messagesService.sendMessage(
      body.senderId,
      body.recipientId,
      body.content,
    );
  }

  @Get('conversation')
  async getConversation(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
  ) {
    return this.messagesService.getConversation(
      parseInt(userId1),
      parseInt(userId2),
    );
  }

  @Get('user/:userId')
  async getUserMessages(@Param('userId') userId: string) {
    return this.messagesService.getUserMessages(parseInt(userId));
  }
}
