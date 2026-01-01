import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * GET /listings - Browse listings with filters
   * Query params: category, price_min, price_max, condition, sort
   */
  @Get()
  async findAll(@Query() queryDto: QueryListingsDto) {
    const listings = await this.listingsService.findAll(queryDto);
    // Convert price from paise to rupees for display
    return listings.map((listing) => ({
      ...listing,
      price_display: `₹${(listing.price / 100).toFixed(2)}`,
    }));
  }

  /**
   * GET /listings/:id - Get listing details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const listing = await this.listingsService.findOne(id);
    return {
      ...listing,
      price_display: `₹${(listing.price / 100).toFixed(2)}`,
    };
  }

  /**
   * POST /listings - Create new listing (requires JWT)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createListingDto: CreateListingDto, @Request() req) {
    const listing = await this.listingsService.create(
      createListingDto,
      req.user.userId,
    );
    return {
      ...listing,
      price_display: `₹${(listing.price / 100).toFixed(2)}`,
    };
  }

  /**
   * PATCH /listings/:id - Edit listing (seller only, requires JWT)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @Request() req,
  ) {
    const listing = await this.listingsService.update(
      id,
      updateListingDto,
      req.user.userId,
    );
    return {
      ...listing,
      price_display: `₹${(listing.price / 100).toFixed(2)}`,
    };
  }

  /**
   * DELETE /listings/:id - Delete listing (seller only, requires JWT)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.listingsService.remove(id, req.user.userId);
    return { message: 'Listing deleted successfully' };
  }
}

