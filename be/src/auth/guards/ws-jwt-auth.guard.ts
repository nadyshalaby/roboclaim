import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

interface WsRequest {
  handshake: {
    auth?: {
      token?: string;
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
    const token = client.handshake.auth?.token;
    const authToken = token?.split(' ')[1];

    if (!authToken) {
      throw new WsException('Unauthorized');
    }

    try {
      const { sub } = this.jwtService.verify<{ sub: string }>(authToken);
      const user = await this.usersService.findOne(sub);
      client.data.user = user;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
