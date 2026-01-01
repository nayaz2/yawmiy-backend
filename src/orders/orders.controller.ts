import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders - Create a new order
   * Requires JWT (buyer must be authenticated)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.createOrder(
      createOrderDto.listing_id,
      req.user.userId,
      createOrderDto.meeting_location,
    );
  }

  /**
   * GET /orders/callback - PhonePe payment redirect callback
   * Public endpoint (no authentication required)
   * PhonePe redirects users here after payment
   */
  @Get('callback')
  async paymentCallback(
    @Query() queryParams: any,
    @Res() res: Response,
  ) {
    // Log all query parameters for debugging
    console.log('PhonePe Callback - All Query Parameters:', JSON.stringify(queryParams, null, 2));

    // Try to extract order ID from various possible parameter names
    const merchantTransactionId = 
      queryParams.merchantTransactionId || 
      queryParams.merchant_transaction_id ||
      queryParams.orderId ||
      queryParams.order_id ||
      queryParams.txnId ||
      queryParams.transactionId;

    const transactionId = 
      queryParams.transactionId || 
      queryParams.transaction_id ||
      queryParams.txnId;

    // HTML template for success page
    const getSuccessHtml = (orderId: string | null, txId: string | null, status: string | null) => {
      const isSuccess = status === 'escrowed';
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment ${isSuccess ? 'Success' : 'Processing'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 400px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .success { color: #10b981; }
            .pending { color: #f59e0b; }
            h1 {
              margin: 0 0 1rem 0;
              color: #1f2937;
            }
            p {
              color: #6b7280;
              margin: 0.5rem 0;
            }
            .order-id {
              font-family: monospace;
              background: #f3f4f6;
              padding: 0.5rem;
              border-radius: 4px;
              margin: 1rem 0;
            }
            .status {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.875rem;
              font-weight: 500;
              margin-top: 1rem;
            }
            .status.escrowed {
              background: #d1fae5;
              color: #065f46;
            }
            .status.pending {
              background: #fef3c7;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon ${isSuccess ? 'success' : 'pending'}">
              ${isSuccess ? '✓' : '⏳'}
            </div>
            <h1>Payment ${isSuccess ? 'Successful!' : 'Processing...'}</h1>
            <p>Your payment has been ${isSuccess ? 'successfully processed' : 'received and is being processed'}.</p>
            ${orderId ? `<div class="order-id">Order ID: ${orderId}</div>` : ''}
            ${txId ? `<p style="font-size: 0.875rem; color: #9ca3af;">Transaction ID: ${txId}</p>` : ''}
            ${status ? `<div class="status ${status}">${status.toUpperCase()}</div>` : ''}
            <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280;">
              ${status ? 'You can close this window and return to the app.' : 'Please check your order status in the app. The webhook will update your order shortly.'}
            </p>
          </div>
        </body>
        </html>
      `;
    };

    // If no order ID found, show a generic success page
    // (PhonePe webhook will handle the actual status update)
    if (!merchantTransactionId) {
      console.warn('PhonePe Callback - No order ID found in query parameters');
      return res.status(200).send(getSuccessHtml(null, transactionId || null, null));
    }

    try {
      // Get order status
      const order = await this.ordersService.getOrderStatus(merchantTransactionId);
      return res.status(200).send(getSuccessHtml(merchantTransactionId, transactionId || null, order.status));
    } catch (error) {
      console.error('PhonePe Callback - Error fetching order:', error);
      // Still show success page even if order not found (webhook might be processing)
      return res.status(200).send(getSuccessHtml(merchantTransactionId, transactionId || null, null));
    }
  }

  /**
   * GET /orders/:order_id - Get order details
   * Requires JWT (buyer or seller only)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':order_id')
  async findOne(@Param('order_id') order_id: string, @Request() req) {
    const order = await this.ordersService.findOne(order_id, req.user.userId);
    return {
      ...order,
      item_price_display: `₹${(order.item_price_paise / 100).toFixed(2)}`,
      platform_fee_display: `₹${(order.platform_fee_paise / 100).toFixed(2)}`,
      phonepe_fee_display: `₹${(order.phonepe_fee_paise / 100).toFixed(2)}`,
      total_display: `₹${(order.total_paise / 100).toFixed(2)}`,
    };
  }

  /**
   * GET /orders - Get all orders for the authenticated user
   * Requires JWT
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const orders = await this.ordersService.findUserOrders(req.user.userId);
    return orders.map((order) => ({
      ...order,
      item_price_display: `₹${(order.item_price_paise / 100).toFixed(2)}`,
      platform_fee_display: `₹${(order.platform_fee_paise / 100).toFixed(2)}`,
      phonepe_fee_display: `₹${(order.phonepe_fee_paise / 100).toFixed(2)}`,
      total_display: `₹${(order.total_paise / 100).toFixed(2)}`,
    }));
  }

  /**
   * POST /orders/:order_id/payment - Initiate PhonePe payment
   * Requires JWT (buyer only)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':order_id/payment')
  async initiatePayment(@Param('order_id') order_id: string, @Request() req) {
    // Verify order belongs to buyer
    await this.ordersService.findOne(order_id, req.user.userId);
    return this.ordersService.initiatePhonePayment(order_id);
  }

  /**
   * POST /orders/webhook - PhonePe payment webhook
   * No authentication (PhonePe calls this)
   */
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-verify') signature: string,
  ) {
    return this.ordersService.handlePhonePaymentWebhook(payload, signature);
  }

  /**
   * PATCH /orders/:order_id/complete - Complete an order
   * Requires JWT (buyer only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':order_id/complete')
  async complete(
    @Param('order_id') order_id: string,
    @Body() completeOrderDto: CompleteOrderDto,
    @Request() req,
  ) {
    const meeting_time = completeOrderDto.meeting_time
      ? new Date(completeOrderDto.meeting_time)
      : undefined;

    return this.ordersService.completeOrder(order_id, req.user.userId, meeting_time);
  }
}

