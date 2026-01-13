import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoutsService } from './scouts.service';
import { Scout, ScoutStatus } from './scout.entity';
import { User } from '../users/user.entity';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ScoutsService', () => {
  let service: ScoutsService;
  let scoutRepository: Repository<Scout>;
  let userRepository: Repository<User>;
  let ordersService: OrdersService;

  const mockScoutRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrdersService = {
    findUserOrders: jest.fn(),
  };

  const mockOrderRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoutsService,
        {
          provide: getRepositoryToken(Scout),
          useValue: mockScoutRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<ScoutsService>(ScoutsService);
    scoutRepository = module.get<Repository<Scout>>(getRepositoryToken(Scout));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAsScout', () => {
    it('should register user as scout if they have completed transaction', async () => {
      const userId = 1;

      // Mock: User has 1 completed transaction
      mockOrderRepository.count.mockResolvedValue(1);

      // Mock: User not already a scout
      mockScoutRepository.findOne.mockResolvedValue(null);

      const mockScout = {
        scout_id: 'scout-uuid',
        user_id: userId,
        status: ScoutStatus.ACTIVE,
        recruits_count: 0,
        earnings_paise: 0,
      };

      mockScoutRepository.create.mockReturnValue(mockScout);
      mockScoutRepository.save.mockResolvedValue(mockScout);

      const result = await service.registerAsScout(userId);

      expect(result.scout_id).toBe('scout-uuid');
      expect(result.message).toBe('Successfully registered as scout');
      expect(mockScoutRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        status: ScoutStatus.ACTIVE,
        recruits_count: 0,
        earnings_paise: 0,
      });
    });

    it('should throw BadRequestException if user has no completed transactions', async () => {
      const userId = 1;

      // Mock: User has 0 completed transactions
      mockOrderRepository.count.mockResolvedValue(0);

      await expect(service.registerAsScout(userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already registered as scout', async () => {
      const userId = 1;

      // Mock: User already a scout
      mockScoutRepository.findOne.mockResolvedValue({
        scout_id: 'existing-scout-uuid',
        user_id: userId,
      });

      await expect(service.registerAsScout(userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('triggerBountyOnFirstSale', () => {
    it('should trigger bounty on first sale if seller has recruiter', async () => {
      const sellerId = 2;
      const recruiterId = 1;
      const amountPaise = 50000;

      const mockSeller = {
        id: sellerId,
        recruiter_id: recruiterId,
        name: 'Recruit User',
      };

      const mockScout = {
        scout_id: 'scout-uuid',
        user_id: recruiterId,
        earnings_paise: 0,
        recruits_count: 0,
      };

      // Mock: This is seller's first completed sale
      mockOrderRepository.count.mockResolvedValue(1);

      mockUserRepository.findOne.mockResolvedValue(mockSeller);
      mockScoutRepository.findOne.mockResolvedValue(mockScout);
      mockScoutRepository.save.mockResolvedValue({
        ...mockScout,
        earnings_paise: 1000, // ₹10
        recruits_count: 1,
      });

      await service.triggerBountyOnFirstSale(sellerId, amountPaise);

      expect(mockScoutRepository.save).toHaveBeenCalled();
      const savedScout = mockScoutRepository.save.mock.calls[0][0];
      expect(savedScout.earnings_paise).toBe(1000);
      expect(savedScout.recruits_count).toBe(1);
    });

    it('should not trigger bounty if seller has no recruiter', async () => {
      const sellerId = 2;
      const amountPaise = 50000;

      const mockSeller = {
        id: sellerId,
        recruiter_id: null, // No recruiter
      };

      mockUserRepository.findOne.mockResolvedValue(mockSeller);

      await service.triggerBountyOnFirstSale(sellerId, amountPaise);

      // Should not call save
      expect(mockScoutRepository.save).not.toHaveBeenCalled();
    });

    it('should not trigger bounty if not first sale', async () => {
      const sellerId = 2;
      const recruiterId = 1;
      const amountPaise = 50000;

      const mockSeller = {
        id: sellerId,
        recruiter_id: recruiterId,
      };

      // Mock: Seller has 2 completed sales (not first)
      mockOrderRepository.count.mockResolvedValue(2);

      mockUserRepository.findOne.mockResolvedValue(mockSeller);

      await service.triggerBountyOnFirstSale(sellerId, amountPaise);

      // Should not call save
      expect(mockScoutRepository.save).not.toHaveBeenCalled();
    });

    it('should not trigger bounty if recruiter is not a scout', async () => {
      const sellerId = 2;
      const recruiterId = 1;
      const amountPaise = 50000;

      const mockSeller = {
        id: sellerId,
        recruiter_id: recruiterId,
      };

      // Mock: This is first sale
      mockOrderRepository.count.mockResolvedValue(1);

      mockUserRepository.findOne.mockResolvedValue(mockSeller);
      // Mock: Recruiter is not a scout
      mockScoutRepository.findOne.mockResolvedValue(null);

      await service.triggerBountyOnFirstSale(sellerId, amountPaise);

      // Should not call save
      expect(mockScoutRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getScoutEarnings', () => {
    it('should return scout earnings with breakdown', async () => {
      const scoutId = 'scout-uuid';
      const userId = 1;

      const mockScout = {
        scout_id: scoutId,
        user_id: userId,
        earnings_paise: 1000,
        recruits_count: 1,
      };

      const mockRecruit = {
        id: 2,
        name: 'Recruit User',
        email: 'recruit@university.edu',
        recruiter_id: userId,
      };

      const mockCompletedOrder = {
        order_id: 'order-uuid',
        seller_id: 2,
        item_price_paise: 50000,
        status: OrderStatus.COMPLETED,
        completed_at: new Date(),
      };

      mockScoutRepository.findOne.mockResolvedValue({ ...mockScout, user: { id: userId } });
      mockUserRepository.find.mockResolvedValue([mockRecruit]);
      
      // Mock createQueryBuilder for the optimized query
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCompletedOrder]),
      };
      mockOrderRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getScoutEarnings(scoutId);

      expect(result.scout_id).toBe(scoutId);
      expect(result.total_earnings).toBe(10); // In rupees (rounded)
      expect(result.total_earnings_display).toBe('₹10'); // Format as "₹10"
      expect(result.recruits_count).toBe(1);
      expect(result.breakdown).toHaveLength(1);
    });

    it('should throw NotFoundException if scout not found', async () => {
      mockScoutRepository.findOne.mockResolvedValue(null);

      await expect(service.getScoutEarnings('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLeaderboard', () => {
    it('should return top scouts by earnings', async () => {
      const mockScouts = [
        {
          scout_id: 'scout-1',
          user_id: 1,
          earnings_paise: 5000,
          recruits_count: 5,
          user: { id: 1, name: 'Top Scout', email: 'top@university.edu' },
        },
        {
          scout_id: 'scout-2',
          user_id: 2,
          earnings_paise: 3000,
          recruits_count: 3,
          user: { id: 2, name: 'Second Scout', email: 'second@university.edu' },
        },
      ];

      mockScoutRepository.find.mockResolvedValue(mockScouts);

      const result = await service.getLeaderboard(10);

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].earnings).toBe(50); // In rupees (rounded, 5000 paise = ₹50)
      expect(result[1].rank).toBe(2);
      expect(result[1].earnings).toBe(30); // In rupees (rounded, 3000 paise = ₹30)
    });
  });
});

