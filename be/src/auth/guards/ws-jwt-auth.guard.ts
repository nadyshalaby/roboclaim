import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token?.replace('Bearer ', '');

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new WsException('User not found');
      }

      client.handshake.auth.userId = user.id;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
