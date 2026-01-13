import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListingsService } from './listings.service';
import { Listing, ListingStatus, ListingCategory, ListingCondition } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { SortOption } from './dto/query-listings.dto';
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
    manager: {
      createQueryBuilder: jest.fn(),
    },
  };

  const mockOrderRepository = {
    count: jest.fn(),
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
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
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
        sort: SortOption.PRICE_ASC,
      };

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'listing-1',
            title: 'Test Item',
            category: ListingCategory.ELECTRONICS,
            price: 25000,
            condition: ListingCondition.GOOD,
            seller_id: 1,
          },
        ]),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.findAll(queryDto);

      expect(result.listings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('listing');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should return all active listings when no filters provided', async () => {
      const queryDto = {};

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'listing-1',
            title: 'Test Item',
            status: ListingStatus.ACTIVE,
            seller_id: 1,
          },
        ]),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.findAll(queryDto);

      expect(result.listings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'listing.status = :status',
        { status: ListingStatus.ACTIVE },
      );
    });

    it('should search in title and description', async () => {
      const queryDto = {
        search: 'laptop',
      };

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'listing-1', title: 'Laptop for sale', seller_id: 1 },
          { id: 'listing-2', title: 'Gaming laptop', seller_id: 2 },
        ]),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn()
          .mockResolvedValueOnce({
            user_id: 1,
            user_name: 'Test Seller 1',
            user_created_at: new Date('2024-01-01'),
          })
          .mockResolvedValueOnce({
            user_id: 2,
            user_name: 'Test Seller 2',
            user_created_at: new Date('2024-01-01'),
          }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.findAll(queryDto);

      expect(result.listings).toHaveLength(2);
      expect(result.total).toBe(2);
      // Full-text search uses tsvector, not LIKE
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('search_vector @@ plainto_tsquery'),
        expect.any(Object),
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
    });

    it('should filter by location', async () => {
      const queryDto = {
        location: 'campus',
      };

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'listing-1', location: 'Main Campus', seller_id: 1 },
        ]),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.findAll(queryDto);

      expect(result.listings).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(listing.location)'),
        expect.any(Object),
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
        seller_id: 1,
      };

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockListing),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.findOne(listingId);

      expect(result.id).toBe(listingId);
      expect(result.seller).toBeDefined();
      expect(result.seller.id).toBe(1);
      expect(result.seller.name).toBe('Test Seller');
    });

    it('should throw NotFoundException if listing not found', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockListing),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

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

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockListing),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: sellerId,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);
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

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockListing),
      };

      const mockSellerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: 1,
          user_name: 'Test Seller',
          user_created_at: new Date('2024-01-01'),
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.manager.createQueryBuilder.mockReturnValue(mockSellerQueryBuilder);
      mockOrderRepository.count.mockResolvedValue(5);

      await expect(service.remove(listingId, wrongSellerId)).rejects.toThrow(ForbiddenException);
    });
  });
});


