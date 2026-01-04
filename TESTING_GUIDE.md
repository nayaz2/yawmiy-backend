# Testing Guide

## Overview

This project uses **Jest** for unit testing and **Supertest** for E2E testing.

---

## Test Files Created

### 1. `src/auth/auth.service.spec.ts`
Tests for authentication service:
- ✅ Register with valid .edu/.edu.in/.ac/.ac.in email
- ✅ Register with invalid email (should fail)
- ✅ Login with correct password
- ✅ Login with wrong password (should fail)
- ✅ Email immutability verification
- ✅ StudentID immutability verification
- ✅ Token validation

### 2. `src/listings/listings.service.spec.ts`
Tests for listings service:
- ✅ Create listing
- ✅ Browse listings with filters
- ✅ Find listing by ID
- ✅ Update listing (seller only)
- ✅ Delete listing (seller only)

### 3. `src/orders/orders.service.spec.ts`
Tests for orders service:
- ✅ Create order and payment
- ✅ Initiate PhonePe payment
- ✅ PhonePe webhook updates order status
- ✅ Complete order
- ✅ Scout bounty triggers on first sale

### 4. `src/scouts/scouts.service.spec.ts`
Tests for scouts service:
- ✅ Register as scout (with completed transaction)
- ✅ Register as scout (without transaction - should fail)
- ✅ Trigger bounty on first sale
- ✅ Get scout earnings
- ✅ Get leaderboard

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npm test -- auth.service.spec.ts
```

---

## Test Structure

Each test file follows this structure:

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: Repository<Entity>;

  beforeEach(async () => {
    // Setup test module with mocked dependencies
  });

  afterEach(() => {
    // Clean up mocks
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## Mocking Strategy

### Database Repositories
All database repositories are mocked using `getRepositoryToken`:

```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
};
```

### External Services
External services (like PhonePe SDK) are mocked:

```typescript
const mockScoutsService = {
  triggerBountyOnFirstSale: jest.fn(),
};
```

### Configuration
ConfigService is mocked with test values:

```typescript
const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      // ... other config values
    };
    return config[key];
  }),
};
```

---

## Test Coverage Goals

Target coverage:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
npm run test:cov
```

Open `coverage/index.html` in browser to see detailed coverage.

---

## Writing New Tests

### 1. Create Test File
Create `*.spec.ts` file next to the service file:
```
src/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts  ← Test file
```

### 2. Import Dependencies
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceName } from './service-name.service';
```

### 3. Mock Dependencies
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};
```

### 4. Write Tests
```typescript
it('should do something', async () => {
  // Arrange
  mockRepository.findOne.mockResolvedValue(mockData);

  // Act
  const result = await service.methodName();

  // Assert
  expect(result).toEqual(expectedResult);
  expect(mockRepository.findOne).toHaveBeenCalled();
});
```

---

## Common Test Patterns

### Testing Success Cases
```typescript
it('should return data on success', async () => {
  mockRepository.findOne.mockResolvedValue(mockData);
  const result = await service.find(id);
  expect(result).toEqual(mockData);
});
```

### Testing Error Cases
```typescript
it('should throw NotFoundException when not found', async () => {
  mockRepository.findOne.mockResolvedValue(null);
  await expect(service.find(id)).rejects.toThrow(NotFoundException);
});
```

### Testing Authorization
```typescript
it('should throw ForbiddenException when user is not authorized', async () => {
  mockRepository.findOne.mockResolvedValue({ seller_id: 1 });
  await expect(service.update(id, data, 2)).rejects.toThrow(ForbiddenException);
});
```

### Testing Business Logic
```typescript
it('should calculate fees correctly', async () => {
  const result = await service.createOrder(listingId, buyerId, location);
  expect(result.platform_fee_paise).toBe(5000); // 10% of 50000
  expect(result.phonepe_fee_paise).toBe(825); // 1.5% of 55000
});
```

---

## Continuous Integration

### GitHub Actions (Example)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:cov
```

---

## Troubleshooting

### Tests Fail with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check import paths are correct

### Tests Fail with "TypeORM connection error"
- Tests should use mocked repositories, not real database
- Check that `getRepositoryToken` is used correctly

### Tests Timeout
- Increase timeout: `jest.setTimeout(10000)`
- Check for async operations not being awaited

### Mock Not Working
- Ensure `jest.clearAllMocks()` is called in `afterEach`
- Check mock is set up before the test runs

---

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Don't make real API calls
5. **Test Edge Cases**: Test both success and failure paths
6. **Keep Tests Fast**: Use mocks, not real database
7. **Clean Up**: Reset mocks after each test

---

## Next Steps

- [ ] Add E2E tests for complete user flows
- [ ] Add integration tests for database operations
- [ ] Set up CI/CD pipeline
- [ ] Add performance tests
- [ ] Add security tests

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)


