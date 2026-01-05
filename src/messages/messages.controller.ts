import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard) // All endpoints require authentication
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /messages - Send a message
   * Body: { recipient_id, content, listing_id? (optional), order_id? (optional) }
   */
  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const message = await this.messagesService.sendMessage(
      req.user.userId,
      createMessageDto,
    );
    return {
      id: message.id,
      content: message.content,
      recipient_id: message.recipient_id,
      listing_id: message.listing_id,
      order_id: message.order_id,
      status: message.status,
      created_at: message.created_at,
    };
  }

  /**
   * GET /messages/conversations - Get all conversations for current user
   * Returns list of users you've messaged with, with last message and unread count
   */
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.userId);
  }

  /**
   * GET /messages/conversations/:userId - Get conversation with specific user
   * Query params: page, limit, listing_id? (optional), order_id? (optional)
   */
  @Get('conversations/:userId')
  async getConversation(
    @Param('userId') userId: string,
    @Query() queryDto: QueryMessagesDto,
    @Request() req,
  ) {
    const otherUserId = parseInt(userId, 10);
    if (isNaN(otherUserId)) {
      throw new Error('Invalid user ID');
    }
    return this.messagesService.getConversation(req.user.userId, otherUserId, queryDto);
  }

  /**
   * GET /messages/unread-count - Get total unread message count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.userId);
    return { unread_count: count };
  }

  /**
   * POST /messages/mark-read - Mark messages as read
   * Body: { message_ids: string[] }
   * Supports both single and multiple message IDs
   * Example: { "message_ids": ["uuid-1"] } or { "message_ids": ["uuid-1", "uuid-2", "uuid-3"] }
   */
  @Post('mark-read')
  async markAsRead(@Body() markReadDto: MarkReadDto, @Request() req) {
    const markedCount = await this.messagesService.markAsRead(req.user.userId, markReadDto.message_ids);
    return {
      message: 'Messages marked as read',
      marked_count: markedCount,
      requested_count: markReadDto.message_ids.length,
    };
  }
}

