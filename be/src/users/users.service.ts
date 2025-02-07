import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // If email is being updated, check if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Update user profile
    Object.assign(user, updateProfileDto);

    // Save the updated user
    await this.userRepository.save(user);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    // Early validation of required fields
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { currentPassword, newPassword } = updatePasswordDto;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Both current and new passwords are required',
      );
    }

    // Find user with password field
    const user = await this.userRepository
      .findOne({
        where: { id: userId },
        select: ['id', 'password'],
      })
      .catch(() => {
        throw new BadRequestException('Failed to fetch user data');
      });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt
      .compare(currentPassword as string, user.password)
      .catch(() => false);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await bcrypt
      .hash(newPassword as string, 10)
      .catch(() => {
        throw new BadRequestException('Failed to process new password');
      });

    await this.userRepository
      .update(userId, { password: hashedPassword })
      .catch(() => {
        throw new BadRequestException('Failed to update password');
      });

    return { message: 'Password updated successfully' };
  }
}
