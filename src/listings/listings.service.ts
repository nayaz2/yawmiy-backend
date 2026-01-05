import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing, ListingStatus } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto, SortOption } from './dto/query-listings.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  /**
   * Create a new listing
   */
  async create(createListingDto: CreateListingDto, sellerId: number): Promise<Listing> {
    const listing = this.listingsRepository.create({
      ...createListingDto,
      seller_id: sellerId,
      status: ListingStatus.ACTIVE,
    });
    return this.listingsRepository.save(listing);
  }

  /**
   * Find all listings with filters, search, and pagination
   */
  async findAll(queryDto: QueryListingsDto): Promise<{
    listings: Listing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE });

    // Text search in title and description
    if (queryDto.search) {
      // Use PostgreSQL full-text search if available, otherwise fallback to LIKE
      // Check if search_vector column exists (for full-text search)
      const useFullTextSearch = true; // Set to false to use LIKE search for compatibility

      if (useFullTextSearch) {
        // PostgreSQL full-text search using tsvector
        // This is much faster than LIKE queries, especially with large datasets
        const searchQuery = queryDto.search
          .split(/\s+/)
          .map((term) => term.trim())
          .filter((term) => term.length > 0)
          .join(' & '); // AND operator for all terms

        queryBuilder.andWhere(
          `listing.search_vector @@ plainto_tsquery('english', :searchQuery)`,
          { searchQuery },
        );

        // Add relevance ranking (optional - improves result quality)
        queryBuilder.addSelect(
          `ts_rank(listing.search_vector, plainto_tsquery('english', :searchQuery))`,
          'relevance',
        );
      } else {
        // Fallback to LIKE search (slower but works without tsvector)
        const searchTerm = `%${queryDto.search.toLowerCase()}%`;
        queryBuilder.andWhere(
          '(LOWER(listing.title) LIKE :search OR LOWER(listing.description) LIKE :search)',
          { search: searchTerm },
        );
      }
    }

    // Category filtering (single or multiple)
    if (queryDto.category) {
      queryBuilder.andWhere('listing.category = :category', {
        category: queryDto.category,
      });
    } else if (queryDto.categories && queryDto.categories.length > 0) {
      queryBuilder.andWhere('listing.category IN (:...categories)', {
        categories: queryDto.categories,
      });
    }

    // Price range
    if (queryDto.price_min !== undefined) {
      queryBuilder.andWhere('listing.price >= :priceMin', {
        priceMin: queryDto.price_min,
      });
    }

    if (queryDto.price_max !== undefined) {
      queryBuilder.andWhere('listing.price <= :priceMax', {
        priceMax: queryDto.price_max,
      });
    }

    // Condition filtering (single or multiple)
    if (queryDto.condition) {
      queryBuilder.andWhere('listing.condition = :condition', {
        condition: queryDto.condition,
      });
    } else if (queryDto.conditions && queryDto.conditions.length > 0) {
      queryBuilder.andWhere('listing.condition IN (:...conditions)', {
        conditions: queryDto.conditions,
      });
    }

    // Location filter (case-insensitive partial match)
    if (queryDto.location) {
      queryBuilder.andWhere('LOWER(listing.location) LIKE LOWER(:location)', {
        location: `%${queryDto.location}%`,
      });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting
    const hasSearch = !!queryDto.search;
    switch (queryDto.sort) {
      case SortOption.PRICE_ASC:
        queryBuilder.orderBy('listing.price', 'ASC');
        break;
      case SortOption.PRICE_DESC:
        queryBuilder.orderBy('listing.price', 'DESC');
        break;
      case SortOption.DATE_ASC:
        queryBuilder.orderBy('listing.created_at', 'ASC');
        break;
      case SortOption.RELEVANCE:
        // For search results, use relevance ranking from full-text search
        if (hasSearch && queryDto.search) {
          const searchQuery = queryDto.search
            .split(/\s+/)
            .map((term) => term.trim())
            .filter((term) => term.length > 0)
            .join(' & ');

          // Order by relevance (ts_rank) if using full-text search
          // Otherwise fallback to title match priority
          queryBuilder
            .orderBy(
              `ts_rank(listing.search_vector, plainto_tsquery('english', :relevanceQuery))`,
              'DESC',
            )
            .addOrderBy('listing.created_at', 'DESC')
            .setParameter('relevanceQuery', searchQuery);
        } else {
          queryBuilder.orderBy('listing.created_at', 'DESC');
        }
        break;
      case SortOption.DATE_DESC:
      default:
        queryBuilder.orderBy('listing.created_at', 'DESC');
        break;
    }

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const listings = await queryBuilder.getMany();

    return {
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one listing by ID
   */
  async findOne(id: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  /**
   * Update a listing (seller only)
   */
  async update(
    id: string,
    updateListingDto: UpdateListingDto,
    userId: number,
  ): Promise<Listing> {
    const listing = await this.findOne(id);

    // Check if user is the seller
    if (listing.seller_id !== userId) {
      throw new ForbiddenException('You can only edit your own listings');
    }

    // Update listing
    Object.assign(listing, updateListingDto);
    return this.listingsRepository.save(listing);
  }

  /**
   * Delete a listing (seller only)
   */
  async remove(id: string, userId: number): Promise<void> {
    const listing = await this.findOne(id);

    // Check if user is the seller
    if (listing.seller_id !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.listingsRepository.remove(listing);
  }
}

