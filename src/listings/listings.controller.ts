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
   * GET /listings - Browse listings with filters, search, and pagination
   * Query params:
   *   - search: Text search in title and description
   *   - category: Single category filter
   *   - categories: Multiple categories (comma-separated)
   *   - price_min, price_max: Price range in paise
   *   - condition: Single condition filter
   *   - conditions: Multiple conditions (comma-separated)
   *   - location: Location filter (partial match)
   *   - sort: price_asc, price_desc, date_asc, date_desc, relevance
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 20, max: 100)
   */
  @Get()
  async findAll(@Query() queryDto: QueryListingsDto) {
    const result = await this.listingsService.findAll(queryDto);

    // Convert price from paise to rupees for display (rounded)
    const listings = result.listings.map((listing) => ({
      ...listing,
      price_display: `₹${Math.round(listing.price / 100)}`, // Rounded rupees, e.g., "₹232"
    }));

    return {
      ...result,
      listings,
    };
  }

  /**
   * GET /listings/:id - Get listing details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const listing = await this.listingsService.findOne(id);
    return {
      ...listing,
      price_display: `₹${Math.round(listing.price / 100)}`, // Rounded rupees, e.g., "₹232"
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
      price_display: `₹${Math.round(listing.price / 100)}`, // Rounded rupees, e.g., "₹232"
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
      price_display: `₹${Math.round(listing.price / 100)}`, // Rounded rupees, e.g., "₹232"
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

