import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListingsService } from './listings.service';
import { Listing, ListingStatus, ListingCategory, ListingCondition } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ListingsService', () => {
  let service: ListingsService;
  let repository: Repository<Listing>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    repository = module.get<Repository<Listing>>(getRepositoryToken(Listing));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a listing successfully', async () => {
      const createDto: CreateListingDto = {
        title: 'Test Book',
        category: ListingCategory.TEXTBOOKS,
        price: 50000, // ₹500 in paise
        condition: ListingCondition.NEW,
        description: 'A test book',
        photos: [],
        location: 'Campus',
      };
      const sellerId = 1;

      const mockListing = {
        id: 'listing-uuid',
        ...createDto,
        seller_id: sellerId,
        status: ListingStatus.ACTIVE,
      };

      mockRepository.create.mockReturnValue(mockListing);
      mockRepository.save.mockResolvedValue(mockListing);

      const result = await service.create(createDto, sellerId);

      expect(result).toEqual(mockListing);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        seller_id: sellerId,
        status: ListingStatus.ACTIVE,
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should browse listings with filters', async () => {
      const queryDto = {
        category: ListingCategory.ELECTRONICS,
        price_min: 10000,
        price_max: 50000,
        condition: ListingCondition.GOOD,
        sort: 'price_asc' as const,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'listing-1',
            title: 'Test Item',
            category: ListingCategory.ELECTRONICS,
            price: 25000,
            condition: ListingCondition.GOOD,
          },
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(queryDto);

      expect(result).toHaveLength(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('listing');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should return all active listings when no filters provided', async () => {
      const queryDto = {};

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'listing-1',
            title: 'Test Item',
            status: ListingStatus.ACTIVE,
          },
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(queryDto);

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'listing.status = :status',
        { status: ListingStatus.ACTIVE },
      );
    });
  });

  describe('findOne', () => {
    it('should find a listing by id', async () => {
      const listingId = 'listing-uuid';
      const mockListing = {
        id: listingId,
        title: 'Test Book',
        status: ListingStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(mockListing);

      const result = await service.findOne(listingId);

      expect(result).toEqual(mockListing);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: listingId },
        relations: ['seller'],
      });
    });

    it('should throw NotFoundException if listing not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update listing if user is seller', async () => {
      const listingId = 'listing-uuid';
      const sellerId = 1;
      const updateDto = { title: 'Updated Title' };

      const mockListing = {
        id: listingId,
        seller_id: sellerId,
        title: 'Original Title',
      };

      mockRepository.findOne.mockResolvedValue(mockListing);
      mockRepository.save.mockResolvedValue({ ...mockListing, ...updateDto });

      const result = await service.update(listingId, updateDto, sellerId);

      expect(result.title).toBe('Updated Title');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not seller', async () => {
      const listingId = 'listing-uuid';
      const wrongSellerId = 2;
      const updateDto = { title: 'Updated Title' };

      const mockListing = {
        id: listingId,
        seller_id: 1, // Different seller
      };

      mockRepository.findOne.mockResolvedValue(mockListing);

      await expect(service.update(listingId, updateDto, wrongSellerId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete listing if user is seller', async () => {
      const listingId = 'listing-uuid';
      const sellerId = 1;

      const mockListing = {
        id: listingId,
        seller_id: sellerId,
      };

      mockRepository.findOne.mockResolvedValue(mockListing);
      mockRepository.remove.mockResolvedValue(mockListing);

      await service.remove(listingId, sellerId);

      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not seller', async () => {
      const listingId = 'listing-uuid';
      const wrongSellerId = 2;

      const mockListing = {
        id: listingId,
        seller_id: 1, // Different seller
      };

      mockRepository.findOne.mockResolvedValue(mockListing);

      await expect(service.remove(listingId, wrongSellerId)).rejects.toThrow(ForbiddenException);
    });
  });
});


