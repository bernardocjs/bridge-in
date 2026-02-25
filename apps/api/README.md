<div align="center">
  <h1>🦌 Deer Ticket</h1>
  <p>A modern file storage platform to collaborate on design files with a simple and intuitive interface.</p>

</div>

## 🔍 Overview

Deer Storage is a streamlined platform designed for designers and customers to collaborate on design files. Upload, review, and provide feedback on designs with a simple and intuitive interface.

## ✨ Features

- **📂 File Upload** - Upload design files in various formats
- **🔍 File Preview** - View design files directly in the browser
- **💬 Commenting** - Provide feedback on designs with comments
- **📝 Annotations** - Add annotations to designs for detailed feedback

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
yarn prisma migrate dev
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
yarn prisma migrate dev
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

<div align="center">
  <p>Made with ❤️ by Gabriel</p>
</div>
