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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Browse listings',
    description: 'Get all listings with optional filters, search, and pagination. Supports text search, category/condition filtering, price range, location, and sorting.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Listings retrieved successfully',
    schema: {
      example: {
        listings: [
          {
            listing_id: 'uuid',
            title: 'Textbook',
            description: 'Used textbook',
            price: 1000,
            price_display: '₹10',
            category: 'books',
            condition: 'used',
            location: 'Campus',
            status: 'active',
            seller: {
              id: 1,
              name: 'John Doe',
              rating: 5.0,
              review_count: 10,
              member_since: 'Member since January 2024'
            }
          }
        ],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5
      }
    }
  })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get listing details', description: 'Get detailed information about a specific listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Listing retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findOne(@Param('id') id: string) {
    const listing = await this.listingsService.findOne(id);
    return {
      ...listing,
      price_display: `₹${Math.round(listing.price / 100)}`, // Rounded rupees, e.g., "₹232"
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new listing', description: 'Create a new product listing. Requires authentication.' })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update listing', description: 'Update an existing listing. Only the seller can update their own listing.' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the seller' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete listing', description: 'Delete a listing. Only the seller can delete their own listing.' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the seller' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.listingsService.remove(id, req.user.userId);
    return { message: 'Listing deleted successfully' };
  }
}

