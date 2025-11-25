import { Controller, Post, Get, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationDto } from './dto/get-conversation.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.messagesService.sendMessage(
      sendMessageDto.senderId,
      sendMessageDto.recipientId,
      sendMessageDto.content,
    );
  }

  @Get('conversation')
  async getConversation(@Query() query: GetConversationDto) {
    return this.messagesService.getConversation(
      query.userId1,
      query.userId2,
    );
  }

  @Get('user/:userId')
  async getUserMessages(@Param('userId', ParseIntPipe) userId: number) {
    return this.messagesService.getUserMessages(userId);
  }
}
