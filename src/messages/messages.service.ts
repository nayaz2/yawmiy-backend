import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message, MessageStatus } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * Send a message from one user to another
   */
  async sendMessage(
    senderId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const recipientId = parseInt(createMessageDto.recipient_id, 10);
    if (isNaN(recipientId)) {
      throw new BadRequestException('Invalid recipient ID');
    }

    // Cannot send message to yourself
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    // Verify recipient exists
    const recipient = await this.usersRepository.findOne({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // If linked to listing, verify listing exists and user has access
    if (createMessageDto.listing_id) {
      const listing = await this.listingsRepository.findOne({
        where: { id: createMessageDto.listing_id },
      });
      if (!listing) {
        throw new NotFoundException('Listing not found');
      }
      // Verify sender is either buyer or seller of the listing
      // (For now, allow any user - can add restrictions later)
    }

    // If linked to order, verify order exists and user has access
    if (createMessageDto.order_id) {
      const order = await this.ordersRepository.findOne({
        where: { order_id: createMessageDto.order_id },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      // Verify sender is either buyer or seller of the order
      if (order.buyer_id !== senderId && order.seller_id !== senderId) {
        throw new ForbiddenException('You can only message about your own orders');
      }
    }

    // Create message
    const message = this.messagesRepository.create({
      sender_id: senderId,
      recipient_id: recipientId,
      content: createMessageDto.content.trim(),
      listing_id: createMessageDto.listing_id,
      order_id: createMessageDto.order_id,
      status: MessageStatus.SENT,
    });

    return this.messagesRepository.save(message);
  }

  /**
   * Get conversation between two users
   * Returns messages between current user and another user
   */
  async getConversation(
    userId: number,
    otherUserId: number,
    queryDto: QueryMessagesDto,
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    other_user: {
      id: number;
      name: string;
      email: string;
    };
  }> {
    // Verify other user exists
    const otherUser = await this.usersRepository.findOne({
      where: { id: otherUserId },
      select: ['id', 'name', 'email'],
    });
    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where(
        '(message.sender_id = :userId AND message.recipient_id = :otherUserId) OR (message.sender_id = :otherUserId AND message.recipient_id = :userId)',
        { userId, otherUserId },
      );

    // Filter by listing if provided
    if (queryDto.listing_id) {
      queryBuilder.andWhere('message.listing_id = :listingId', {
        listingId: queryDto.listing_id,
      });
    }

    // Filter by order if provided
    if (queryDto.order_id) {
      queryBuilder.andWhere('message.order_id = :orderId', {
        orderId: queryDto.order_id,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Order by created_at (oldest first for conversation view)
    queryBuilder.orderBy('message.created_at', 'ASC');

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 50;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const messages = await queryBuilder.getMany();

    // Mark messages as read if they were sent to current user
    const unreadMessages = messages.filter(
      (msg) => msg.recipient_id === userId && msg.status !== MessageStatus.READ,
    );
    if (unreadMessages.length > 0) {
      const unreadMessageIds = unreadMessages.map((m) => m.id);
      await this.messagesRepository.update(
        { id: In(unreadMessageIds), recipient_id: userId, status: MessageStatus.SENT },
        {
          status: MessageStatus.READ,
          read_at: new Date(),
        },
      );
      // Update the in-memory objects
      unreadMessages.forEach((msg) => {
        msg.status = MessageStatus.READ;
        msg.read_at = new Date();
      });
    }

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      other_user: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
      },
    };
  }

  /**
   * Get all conversations for a user
   * Returns list of users the current user has messaged with
   */
  async getConversations(userId: number): Promise<
    Array<{
      user: {
        id: number;
        name: string;
        email: string;
      };
      last_message: {
        id: string;
        content: string;
        created_at: Date;
        is_sent_by_me: boolean;
      } | null;
      unread_count: number;
    }>
  > {
    // Get distinct conversations (users who have messaged with current user)
    const conversations = await this.messagesRepository
      .createQueryBuilder('message')
      .select([
        'CASE WHEN message.sender_id = :userId THEN message.recipient_id ELSE message.sender_id END as other_user_id',
        'MAX(message.created_at) as last_message_time',
      ])
      .where('message.sender_id = :userId OR message.recipient_id = :userId', {
        userId,
      })
      .groupBy('other_user_id')
      .orderBy('last_message_time', 'DESC')
      .getRawMany();

    const result: Array<{
      user: {
        id: number;
        name: string;
        email: string;
      };
      last_message: {
        id: string;
        content: string;
        created_at: Date;
        is_sent_by_me: boolean;
      } | null;
      unread_count: number;
    }> = [];

    for (const conv of conversations) {
      const otherUserId = parseInt(conv.other_user_id, 10);

      // Get other user details
      const otherUser = await this.usersRepository.findOne({
        where: { id: otherUserId },
        select: ['id', 'name', 'email'],
      });

      if (!otherUser) continue;

      // Get last message
      const lastMessage = await this.messagesRepository.findOne({
        where: [
          { sender_id: userId, recipient_id: otherUserId },
          { sender_id: otherUserId, recipient_id: userId },
        ],
        order: { created_at: 'DESC' },
      });

      // Count unread messages
      const unreadCount = await this.messagesRepository.count({
        where: {
          sender_id: otherUserId,
          recipient_id: userId,
          status: MessageStatus.SENT, // Unread messages
        },
      });

      result.push({
        user: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
        },
        last_message: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              is_sent_by_me: lastMessage.sender_id === userId,
            }
          : null,
        unread_count: unreadCount,
      });
    }

    return result;
  }

  /**
   * Mark messages as read
   * Supports both single and multiple message IDs
   * @returns Number of messages actually marked as read
   */
  async markAsRead(userId: number, messageIds: string[]): Promise<number> {
    if (!messageIds || messageIds.length === 0) {
      throw new BadRequestException('message_ids array is required and cannot be empty');
    }

    // Filter out any invalid/empty IDs
    const validMessageIds = messageIds.filter((id) => id && id.trim().length > 0);
    if (validMessageIds.length === 0) {
      throw new BadRequestException('At least one valid message ID is required');
    }

    // Use In operator for multiple IDs (works for both single and multiple)
    const updateResult = await this.messagesRepository.update(
      {
        id: In(validMessageIds),
        recipient_id: userId,
        status: MessageStatus.SENT, // Only mark unread messages
      },
      {
        status: MessageStatus.READ,
        read_at: new Date(),
      },
    );

    // Return the number of messages actually updated
    return updateResult.affected || 0;
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.messagesRepository.count({
      where: {
        recipient_id: userId,
        status: MessageStatus.SENT,
      },
    });
  }
}

