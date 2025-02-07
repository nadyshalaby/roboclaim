# RoboClaim

## Description
RoboClaim is a modern web application built with a microservices architecture, featuring a Next.js frontend and NestJS backend. It provides a robust platform for managing claims with automated processing capabilities.

## Technologies

### Backend (NestJS)
- Node.js & TypeScript
- NestJS Framework
- PostgreSQL with TypeORM
- Bull for job queues
- WebSocket support
- JWT Authentication
- PDF parsing capabilities
- CSV processing
- Unit and E2E testing with Jest

### Frontend (Next.js)
- React 19 with Next.js 15
- TypeScript
- TanStack Query for data fetching
- Zustand for state management
- React Hook Form with Zod validation
- Tailwind CSS with Headless UI
- Socket.io client for real-time features
- Testing with Vitest and Cypress

### DevOps
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Environment configuration

## Features
- User authentication and authorization
- Real-time updates via WebSocket
- File upload and processing (PDF, CSV)
- Role-based access control (Admin/User)
- Responsive and modern UI
- Automated test suite
- Queue-based background processing
- API documentation with Swagger

## Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roboclaim.git
cd roboclaim
```

2. Install dependencies:
```bash
# Install backend dependencies
cd be
npm install

# Install frontend dependencies
cd ../fe
npm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp .env.example .env
```

4. Start the development environment:
```bash
# Start all services using Docker Compose
docker-compose up -d

# Or start services individually:
# Backend
cd be
npm run start:dev

# Frontend
cd fe
npm run dev
```

5. Seed the database:
```bash
cd be
npm run seed
```

## Development

### Backend Development
```bash
cd be
npm run start:dev     # Start development server
npm run test         # Run tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Lint code
```

### Frontend Development
```bash
cd fe
npm run dev           # Start development server
npm run test         # Run tests
npm run cypress      # Run E2E tests
npm run lint        # Lint code
```

## Testing
- Backend: Jest for unit and E2E testing
- Frontend: Vitest for unit testing, Cypress for E2E testing

Run all tests:
```bash
# Backend tests
cd be
npm run test        # Unit tests
npm run test:e2e   # E2E tests
npm run test:cov   # Coverage report

# Frontend tests
cd fe
npm run test       # Unit tests
npm run cypress    # E2E tests
npm run test:coverage # Coverage report
```

## Deployment

### Docker Deployment
1. Build and run using Docker Compose:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build the applications:
```bash
# Backend
cd be
npm run build

# Frontend
cd fe
npm run build
```

2. Start the production servers:
```bash
# Backend
cd be
npm run start:prod

# Frontend
cd fe
npm run start
```

## API Documentation
- Access Swagger documentation at: `http://localhost:3000/api`
- WebSocket endpoints documentation available in the backend README

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Default Users
After running the seeder, you can log in with these credentials:

Admin User:
- Email: admin@example.com
- Password: password

Regular User:
- Email: user@example.com
- Password: password

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Maintainers
- [Nady Shalaby](https://github.com/nadyshalaby) - *Initial work and maintainer*

## Acknowledgments
- NestJS Team for the excellent backend framework
- Vercel Team for Next.js
- All contributors who have helped shape this project

## Support
For support, please open an issue in the GitHub repository or contact the maintainers directly.
