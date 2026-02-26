# Swagger API Documentation Guide

**Date:** January 13, 2026  
**Status:** ✅ Implemented

---

## Overview

Swagger/OpenAPI documentation has been integrated into the Yawmiy Backend API. This provides interactive API documentation that allows developers to explore and test all endpoints.

---

## 🚀 Accessing Swagger Documentation

### Development:
```
http://localhost:3000/api/docs
```

### Production:
```
https://your-domain.com/api/docs
```

---

## ✅ What's Included

### 1. **API Documentation Setup**
- ✅ Swagger UI integrated
- ✅ OpenAPI 3.0 specification
- ✅ Interactive API explorer
- ✅ JWT Bearer token authentication
- ✅ Request/response examples
- ✅ Error response documentation

### 2. **Documented Endpoints**

#### Authentication (`/auth`)
- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - Login user
- ✅ `POST /auth/validate-token` - Validate JWT token

#### Listings (`/listings`)
- ✅ `GET /listings` - Browse listings (with filters)
- 🔄 More endpoints being documented...

---

## 📋 Features

### Interactive Testing
- **Try It Out** - Test endpoints directly from the browser
- **Request Builder** - Easy request construction
- **Response Viewer** - See actual API responses
- **Error Handling** - View error responses

### Authentication
- **Bearer Token** - JWT authentication support
- **Persistent Auth** - Token persists after page refresh
- **Easy Testing** - Click "Authorize" button to add token

### Documentation
- **Request Examples** - Pre-filled example requests
- **Response Schemas** - Detailed response structures
- **Error Codes** - All possible error responses
- **Validation Rules** - Input validation requirements

---

## 🔧 Configuration

### Swagger Setup (in `src/main.ts`):

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('Yawmiy Backend API')
  .setDescription('API documentation for Yawmiy marketplace')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('listings', 'Product listing endpoints')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
  .addServer('http://localhost:3000', 'Development server')
  .addServer('https://yawmiy-backend.onrender.com', 'Production server')
  .build();
```

---

## 📝 Adding Documentation to Endpoints

### Controller Example:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  @Get()
  @ApiOperation({ 
    summary: 'Browse listings',
    description: 'Get all listings with filters and pagination'
  })
  @ApiResponse({ status: 200, description: 'Listings retrieved successfully' })
  async findAll() {
    // ...
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create listing' })
  @ApiResponse({ status: 201, description: 'Listing created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create() {
    // ...
  }
}
```

### DTO Example:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({
    description: 'Listing title',
    example: 'Textbook for Sale',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  title: string;
}
```

---

## 🔐 Authentication in Swagger

### How to Use:

1. **Login** via `/auth/login` endpoint
2. **Copy the token** from the response
3. **Click "Authorize"** button (top right)
4. **Paste token** in the "Value" field
5. **Click "Authorize"** and "Close"
6. **All protected endpoints** now use your token automatically

### Token Format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 API Tags

Endpoints are organized by tags:

- **auth** - Authentication endpoints
- **users** - User management
- **listings** - Product listings
- **orders** - Order management
- **messages** - Messaging system
- **scouts** - Scout/referral system
- **payouts** - Payout management
- **admin** - Admin panel

---

## 🎯 Best Practices

### 1. **Always Document:**
- Request body structure
- Response structure
- Error responses
- Authentication requirements

### 2. **Use Examples:**
- Provide realistic example values
- Show expected response format
- Include error examples

### 3. **Clear Descriptions:**
- Explain what the endpoint does
- Document query parameters
- Describe filters and sorting

### 4. **Security:**
- Mark protected endpoints with `@ApiBearerAuth()`
- Document required roles/permissions
- Show authentication flow

---

## 🧪 Testing Endpoints

### Step-by-Step:

1. **Open Swagger UI**: `http://localhost:3000/api/docs`
2. **Find endpoint** in the list
3. **Click "Try it out"**
4. **Fill in parameters** (if any)
5. **Add authentication** (if required)
6. **Click "Execute"**
7. **View response** below

### Example: Testing Login

1. Navigate to `POST /auth/login`
2. Click "Try it out"
3. Enter:
   ```json
   {
     "email": "student@university.edu",
     "password": "Password123!"
   }
   ```
4. Click "Execute"
5. Copy the `token` from response
6. Use it in "Authorize" for other endpoints

---

## 📚 Swagger Decorators Reference

### Controller Decorators:

| Decorator | Purpose |
|-----------|---------|
| `@ApiTags('tag')` | Group endpoints by tag |
| `@ApiOperation({ summary, description })` | Endpoint description |
| `@ApiResponse({ status, description })` | Response documentation |
| `@ApiBearerAuth('JWT-auth')` | Require JWT authentication |
| `@ApiParam({ name, description })` | Path parameter docs |
| `@ApiQuery({ name, description })` | Query parameter docs |

### DTO Decorators:

| Decorator | Purpose |
|-----------|---------|
| `@ApiProperty({ description, example })` | Property documentation |
| `@ApiPropertyOptional()` | Optional property |
| `@ApiHideProperty()` | Hide from docs |

---

## 🔄 Next Steps

### To Complete Documentation:

1. **Add decorators to all controllers:**
   - [x] AuthController
   - [x] ListingsController (partial)
   - [ ] OrdersController
   - [ ] MessagesController
   - [ ] ScoutsController
   - [ ] PayoutsController
   - [ ] AdminController

2. **Add decorators to all DTOs:**
   - [x] RegisterDto
   - [x] LoginDto
   - [ ] CreateListingDto
   - [ ] CreateOrderDto
   - [ ] CreateMessageDto
   - [ ] And more...

3. **Add response examples:**
   - Success responses
   - Error responses
   - Validation errors

---

## 🛠️ Customization

### Custom CSS:
Swagger UI can be customized in `main.ts`:

```typescript
SwaggerModule.setup('api/docs', app, document, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Yawmiy API Documentation',
});
```

### Additional Servers:
Add more server environments:

```typescript
.addServer('http://localhost:3000', 'Development')
.addServer('https://staging.example.com', 'Staging')
.addServer('https://api.example.com', 'Production')
```

---

## 📖 Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## ✅ Benefits

1. **Developer Experience** - Easy API exploration
2. **Testing** - Test endpoints without Postman
3. **Documentation** - Always up-to-date API docs
4. **Onboarding** - New developers can understand API quickly
5. **Integration** - Frontend teams can see exact API structure

---

**Implementation Date:** January 13, 2026  
**Status:** ✅ Basic Setup Complete  
**Next:** Add decorators to all remaining endpoints
