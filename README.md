<div align="center">
  <h1>🔒 Bridge-In</h1>
  <p>Anonymous report management platform for companies, built with NestJS and React in a Turborepo monorepo.</p>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js `>=22.12.0` (run `nvm use` at the repo root)
- Yarn `>=1.22`
- Docker (for the local database)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd bridge-in

# Install dependencies
yarn install

# Set up API environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your settings
```

### Database

```bash
# Start PostgreSQL locally via Docker
docker-compose -f apps/api/docker-compose.yml up -d

# Run migrations
yarn db:migrate
```

### Development

```bash
# Start API + Web in parallel with hot-reload
yarn dev
```

Access:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

### Production build

```bash
yarn build
```

## 💻 Tech Stack

### Backend (`apps/api`)

| Technology         | Purpose            |
| ------------------ | ------------------ |
| NestJS             | HTTP framework     |
| Prisma             | ORM                |
| PostgreSQL         | Database           |
| JWT + Passport     | Authentication     |
| class-validator    | DTO validation     |
| Helmet + Throttler | Security           |
| Swagger            | API documentation  |
| nestjs-pino        | Structured logging |
| Vitest             | Unit testing       |

### Frontend (`apps/web`)

| Technology            | Purpose             |
| --------------------- | ------------------- |
| React 18 + TypeScript | UI                  |
| Vite                  | Bundler             |
| React Router v7       | Routing             |
| TanStack Query        | Server state        |
| Zustand               | Client state (auth) |
| shadcn/ui + Radix UI  | Components          |
| Tailwind CSS v4       | Styling             |
| React Hook Form + Zod | Forms               |
| Axios                 | HTTP client         |

## 📋 API

All endpoints are prefixed with `/api`. Full interactive docs available at `/api/docs` (development only).
