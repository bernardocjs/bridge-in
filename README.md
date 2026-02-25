<div align="center">
  <h1>🦌 Deer Ticket</h1>
  <p>A modern ticket management system built with NestJS and React Vite in a Turborepo monorepo.</p>

  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#api">API</a>
  </p>
  
  <p>
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
    <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg">
  </p>
</div>

### 🚧 Disclaimer

I had problems to deploy the backend of application, so I decided to deploy only the frontend with mocks. You can access the application in the link below:

- [Deer Ticket](https://deer-ticket.vercel.app/)

## 🔍 Overview

Deer Ticket is a streamlined platform designed for efficient team ticket management. Create, assign, and track tickets with skill-based routing to ensure tasks reach the right team members.

## ✨ Features

- **🎟️ Ticket Submission** - Create tickets with title, description, and deadline
- **🎯 Skill-based Assignment** - Automatically route tickets to qualified team members
- **📊 Status Tracking** - Monitor ticket progress through a clean dashboard
- **👥 Team Management** - Organize members and their skills for optimal task distribution

## 🏗️ Architecture

Deer Ticket is built as a full-stack monorepo using Turborepo with:

- **Backend**: NestJS REST API with Prisma ORM
- **Frontend**: React with Vite, TypeScript, and shadcn/ui
- **Infrastructure**: Turborepo for monorepo management

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- yarn (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/devzgabriel/deer-ticket.git
cd deer-ticket

# Install dependencies
yarn install

# Configure environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database settings

# Setup the database
yarn db:migrate
```

### Development

```bash
# Start all services
yarn dev
```

Access the app at:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)

### Database Management

```bash
# Run database migrations
yarn db:migrate
```

### Building for Production

```bash
# Build all packages
yarn build
```

## 💻 Tech Stack

### Backend (NestJS)

- REST API with full CRUD operations
- Prisma ORM with SQLite database
- Input validation with class-validator
- Skill-based ticket assignment logic

### Frontend (React + Vite)

- Modern React with hooks and TypeScript
- Form handling with react-hook-form
- UI components with shadcn/ui
- State management with React Query

## 📋 API Documentation

### Endpoints

#### Tickets

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/tickets`            | List all tickets     |
| GET    | `/tickets/:id`        | Get ticket details   |
| POST   | `/tickets`            | Create new ticket    |
| PATCH  | `/tickets/:id`        | Update ticket        |
| PATCH  | `/tickets/:id/status` | Update ticket status |
| DELETE | `/tickets/:id`        | Delete ticket        |

#### Team Members

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | `/team-members`     | List all members   |
| GET    | `/team-members/:id` | Get member details |

---

<div align="center">
  <p>Made with ❤️ by Gabriel</p>
</div>
