<div align="center">
  <h1>🔒 Bridge-In API</h1>
  <p>REST API for anonymous report management — built with NestJS, Prisma and PostgreSQL.</p>
</div>

## 🔍 Overview

The Bridge-In API handles all business logic: authentication, company management, member control, and receiving/managing anonymous reports.

## 🚀 Getting Started

### Prerequisites

- Node.js `>=22.12.0`
- Yarn `>=1.22`
- Docker (for the local database)

### Installation

```bash
# From the monorepo root
yarn install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your settings
```

### Database

```bash
# Start PostgreSQL via Docker
docker-compose -f apps/api/docker-compose.yml up -d

# Run migrations
yarn db:migrate

# (Optional) Run seed
cd apps/api && yarn db:seed
```

### Development

```bash
# From the monorepo root
yarn dev

# Or API only
yarn workspace api dev
```

API available at http://localhost:3000  
Swagger at http://localhost:3000/api/docs

### Tests

```bash
yarn workspace api test
yarn workspace api test:cov
```
