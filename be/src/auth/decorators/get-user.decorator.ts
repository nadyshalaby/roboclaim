import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from 'src/files/dto/user.dto';

interface RequestWithUser {
  user: UserDto;
}

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserDto => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
