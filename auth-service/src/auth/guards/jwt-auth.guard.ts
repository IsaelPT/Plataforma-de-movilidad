import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: Error | null, user: TUser, info: Error | null): TUser {
    if (err || !user) {
      if (info?.message?.includes('jwt expired')) {
        throw new UnauthorizedException('Token expirado');
      }
      throw err || new UnauthorizedException('No autorizado');
    }
    return user;
  }
}