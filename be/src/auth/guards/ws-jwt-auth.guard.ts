import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

interface WsRequest {
  handshake: {
    auth?: {
      token?: string;
      userId?: string;
    };
  };
  data: {
    user: User;
  };
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WsRequest>();
    const { token, userId } = client.handshake.auth || {};

    if (!token || !userId) {
      throw new WsException('Missing authentication credentials');
    }

    const authToken = token.split(' ')[1];

    try {
      const { sub } = this.jwtService.verify<{ sub: string }>(authToken);

      // Verify that the token's subject matches the provided userId
      if (sub !== userId) {
        throw new WsException('Invalid user credentials');
      }

      const user = await this.usersService.findOne(sub);
      if (!user) {
        throw new WsException('User not found');
      }

      client.data = { user };
      return true;
    } catch (error: unknown) {
      throw new WsException(
        error instanceof Error ? error.message : 'Invalid token',
      );
    }
  }
}
