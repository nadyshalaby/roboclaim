import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const createTestUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  // Check if test users already exist
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });
  const existingUser = await userRepository.findOne({
    where: { email: 'user@example.com' },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create admin user if doesn't exist
  if (!existingAdmin) {
    await userRepository.save(
      userRepository.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      }),
    );
  }

  // Create regular user if doesn't exist
  if (!existingUser) {
    await userRepository.save(
      userRepository.create({
        email: 'user@example.com',
        password: hashedPassword,
        role: UserRole.USER,
      }),
    );
  }
};
