import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Add custom logic here
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'] || request.headers['Authorization'];
      
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header with Bearer token is required');
      }
      
      if (!authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Authorization header must start with "Bearer "');
      }
      
      if (info) {
        // Handle specific JWT errors
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (info.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
        if (info.name === 'NotBeforeError') {
          throw new UnauthorizedException('Token not active yet');
        }
      }
      
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

