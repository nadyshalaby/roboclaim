# RoboClaim

## Description
RoboClaim is a modern web application built with a microservices architecture, featuring a React frontend and NestJS backend. It provides a robust platform for managing claims with automated processing capabilities, real-time updates, and advanced file management features.

## Technologies

### Backend (NestJS v11)
- Node.js v23 & TypeScript
- NestJS Framework with Express
- PostgreSQL with TypeORM
- Bull for job queues with Redis
- WebSocket support (Socket.io)
- JWT Authentication with Passport
- PDF parsing with pdf-parse
- CSV processing
- OCR capabilities with Tesseract.js
- File management with Multer
- Swagger API documentation

### Frontend
- React 19
- TypeScript
- TanStack Query v5 for data fetching
- Zustand v5 for state management
- React Hook Form with Zod validation
- Tailwind CSS with Headless UI v2
- Socket.io client for real-time updates
- React Dropzone for file uploads
- Cypress v14 for E2E testing
- Date handling with date-fns v4

### DevOps
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Multi-stage Docker builds
- Development with hot-reload
- Volume mapping for local development

## Features
- User authentication with JWT
- Role-based access control (Admin/User)
- Real-time file status updates via WebSocket
- Multi-format file upload and processing
  - PDF parsing and text extraction
  - CSV data processing
  - OCR capabilities for images
- Background job processing with Redis queues
- Modern, responsive UI with Tailwind CSS
- Interactive file management interface
- Comprehensive API documentation with Swagger
- Real-time notifications with toast messages

## Prerequisites
- Node.js (v23)
- Docker and Docker Compose
- PostgreSQL
- pnpm (for backend)
- npm (for frontend)

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
pnpm install

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

## Development

The project uses different package managers for optimal performance:
- Backend: `pnpm` (v10)
- Frontend: `npm`

### Backend Development
```bash
cd be
pnpm install        # Install dependencies
pnpm start:dev     # Start development server with hot-reload
pnpm seed           # Seed the database with initial data
```

### Frontend Development
```bash
cd fe
npm install        # Install dependencies
npm run dev        # Start development server
npm run cypress    # Open Cypress test runner
npm run cypress:headless  # Run Cypress tests in headless mode
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build
```

## Deployment

### Docker Deployment
1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Build and run using Docker Compose:
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set up dependencies:
- PostgreSQL (v16)
- Redis (v7)
- Node.js (v23)

2. Build and start the backend:
```bash
cd be
pnpm install
pnpm build
pnpm start:prod
```

3. Build and start the frontend:
```bash
cd fe
npm install
npm run build
npm start
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
