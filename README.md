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
- Docker and Docker Compose
- Node.js (v23) - for running Cypress tests locally

## Installation & Development

1. Clone the repository:
```bash
git clone https://github.com/nadyshalaby/roboclaim.git
cd roboclaim
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the application:
```bash
# Launch all services using Docker Compose
docker-compose up -d
```

4. Seed the database (must be run inside the backend container):
```bash
# Access the backend container
docker exec -it roboclaim-backend-1 bash

# Run the seeding command
pnpm seed

# Exit the container
exit
```

5. Running tests (must be run on your local machine):
```bash
# Run tests from your local machine
cd fe
# you need to have node 23 installed globally
npm run cypress         # Opens Cypress test runner
# or
npm run cypress:headless # Runs tests in headless mode
# or 
npm run test:e2e         # Runs e2e tests
```

> **Important Notes**:
> - All development services are handled by Docker Compose - no need to run additional commands
> - Frontend will be available at `http://localhost:3001`
> - Backend API will be available at `http://localhost:3000`
> - Database seeding must be run from inside the backend container
> ### Running Tests
> Cypress tests should be run from your local machine, not from within Docker containers. This is necessary for Cypress to properly launch and control the browser:
> 
> ```bash
> # From your local machine
> cd fe
> # Ensure Cypress is installed
> npm run cypress  # Opens Cypress test runner
> # or
> npm run cypress:headless  # Runs tests in headless mode
> ```

> **Note**: Running Cypress inside Docker containers can cause issues with browser launching and display handling. Always run Cypress tests from your local development machine for the best experience.


## Hint for Docker users

The project uses different package managers for optimal performance:
- Backend: `pnpm` (v10)
- Frontend: `npm`

### Deployment
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
