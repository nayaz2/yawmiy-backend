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
   * Find all listings with filters
   */
  async findAll(queryDto: QueryListingsDto): Promise<Listing[]> {
    const queryBuilder = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE });

    // Apply filters
    if (queryDto.category) {
      queryBuilder.andWhere('listing.category = :category', {
        category: queryDto.category,
      });
    }

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

    if (queryDto.condition) {
      queryBuilder.andWhere('listing.condition = :condition', {
        condition: queryDto.condition,
      });
    }

    // Apply sorting
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
      case SortOption.DATE_DESC:
      default:
        queryBuilder.orderBy('listing.created_at', 'DESC');
        break;
    }

    return queryBuilder.getMany();
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

