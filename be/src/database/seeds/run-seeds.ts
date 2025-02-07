import { DataSource } from 'typeorm';
import { createTestUsers } from './test-users.seed';

const dataSource = new DataSource({
  type: 'postgres', // or your database type
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'roboclaim',
  entities: ['src/**/*.entity.ts'],
  synchronize: true, // be careful with this in production
});

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run the test users seeder
    await createTestUsers(dataSource);
    console.log('Test users have been created successfully!');

    await dataSource.destroy();
    console.log('Data Source has been closed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeds();
