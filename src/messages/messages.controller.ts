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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard) // All endpoints require authentication
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Send message',
    description: 'Send a message to another user. Can optionally link to a listing or order.'
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
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

  @Get('conversations')
  @ApiOperation({ 
    summary: 'Get conversations',
    description: 'Get all conversations for the current user. Returns list of users with last message and unread count.'
  })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @Get('conversations/:userId')
  @ApiOperation({ 
    summary: 'Get conversation',
    description: 'Get conversation messages with a specific user. Supports pagination and optional filtering by listing/order.'
  })
  @ApiParam({ name: 'userId', description: 'User ID to get conversation with', example: 1 })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
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

  @Get('unread-count')
  @ApiOperation({ 
    summary: 'Get unread count',
    description: 'Get total count of unread messages for the current user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved',
    schema: { example: { unread_count: 5 } }
  })
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.userId);
    return { unread_count: count };
  }

  @Post('mark-read')
  @ApiOperation({ 
    summary: 'Mark messages as read',
    description: 'Mark one or more messages as read. Supports both single and multiple message IDs.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Messages marked as read',
    schema: {
      example: {
        message: 'Messages marked as read',
        marked_count: 3,
        requested_count: 3
      }
    }
  })
  async markAsRead(@Body() markReadDto: MarkReadDto, @Request() req) {
    const markedCount = await this.messagesService.markAsRead(req.user.userId, markReadDto.message_ids);
    return {
      message: 'Messages marked as read',
      marked_count: markedCount,
      requested_count: markReadDto.message_ids.length,
    };
  }
}

