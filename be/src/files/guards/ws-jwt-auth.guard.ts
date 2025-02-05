import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

interface AuthenticatedSocket extends Socket {
  data: {
    user: User;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = client.handshake.auth?.token as string | undefined;
    const authToken = token?.split(' ')[1];

    if (!authToken) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(authToken);
      const user = await this.usersService.findOne(payload.sub);
      client.data.user = user;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
