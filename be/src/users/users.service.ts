import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return { message: 'User deleted successfully' };
  }
}
