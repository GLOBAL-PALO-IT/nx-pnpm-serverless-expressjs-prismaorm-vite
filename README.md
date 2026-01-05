# Nx Serverless Monorepo

A modern full-stack TypeScript monorepo built with Nx, featuring a React frontend and Express.js serverless backend.

> **📌 Recent Update**: The project has been refactored for better modularity:
> - Database layer: `packages/data` (Prisma)
> - Business logic: `packages/services`
> - Validation schemas: `packages/types` (Zod schemas)
> 
> See [REFACTORING-SUMMARY.md](REFACTORING-SUMMARY.md) for details.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:backend    # Backend API (http://localhost:3000)
pnpm dev:frontend   # Frontend app (http://localhost:4200)

# Lint your code
pnpm lint          # Lint both backend and frontend
pnpm lint:fix      # Lint and auto-fix issues

# Build for production
pnpm build:backend
pnpm build:frontend
```

## 🚀 Features

- **Nx Monorepo**: Efficient workspace management with powerful CLI tools
- **React Frontend**: Modern React app with Vite, TypeScript, and React Router
- **Express.js Backend**: Serverless-ready API with AWS Lambda support
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **TypeScript**: Full type safety across the entire stack
- **ESLint + Prettier**: Consistent code formatting and linting
- **pnpm**: Fast and efficient package management

## 📁 Project Structure

```
nx-serverless/
├── apps/
│   ├── backend/               # Express.js serverless API
│   │   ├── src/
│   │   │   ├── app.ts        # Express app configuration
│   │   │   ├── lambda.ts     # AWS Lambda handler
│   │   │   ├── main.ts       # Local development server
│   │   │   ├── middleware/   # Auth and validation middleware
│   │   │   ├── routes/       # API route handlers
│   │   │   └── schemas/      # Zod validation schemas
│   │   └── project.json      # Nx project configuration
│   ├── frontend/             # React frontend application
│   │   ├── src/
│   │   │   ├── app/          # Main app component
│   │   │   ├── components/   # Reusable React components
│   │   │   ├── contexts/     # React contexts (Auth, etc.)
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API client and services
│   │   │   └── main.tsx      # Application entry point
│   │   └── vite.config.ts    # Vite configuration
│   └── frontend-e2e/         # End-to-end tests with Cypress
├── packages/                 # Shared libraries
│   ├── data/                 # Database layer (Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema definition
│   │   │   └── seed.ts       # Database seeding script
│   │   ├── src/
│   │   │   └── index.ts      # Prisma client export
│   │   └── project.json      # Nx project configuration
│   ├── services/             # Business logic layer
│   │   ├── src/
│   │   │   ├── authService.ts    # Authentication service
│   │   │   ├── postService.ts    # Post CRUD service
│   │   │   ├── userService.ts    # User management service
│   │   │   └── index.ts          # Barrel export
│   │   └── project.json      # Nx project configuration
│   └── types/                # Zod schemas & TypeScript types
│       ├── src/
│       │   ├── authSchemas.ts    # Auth validation schemas
│       │   ├── postSchemas.ts    # Post validation schemas
│       │   ├── userSchemas.ts    # User validation schemas
│       │   └── index.ts          # Barrel export
│       └── project.json      # Nx project configuration
├── nx.json                  # Nx workspace configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Workspace dependencies and scripts
```

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL database (for production)

## ✅ Current Status

This monorepo is fully functional with:

- ✅ **Backend**: Express.js API running in both regular and serverless modes
- ✅ **Frontend**: Modern React app with beautiful UI and API integration
- ✅ **Database**: Prisma ORM configured with PostgreSQL support
- ✅ **User Management**: Full CRUD operations for users
- ✅ **Post Management**: Full CRUD operations for posts with author relationships
- ✅ **Development**: Hot reload and development servers for both apps
- ✅ **TypeScript**: Full type safety across the entire stack
- ✅ **Testing**: Jest and Cypress testing setup
- ✅ **Linting**: ESLint and Prettier configured

### 🌐 Live Endpoints

When running locally:
- **Backend API**: http://localhost:3000
- **Frontend App**: http://localhost:4200
- **API Health**: http://localhost:3000/health
- **API Test**: http://localhost:3000/api/test

#### User Management API
- **GET** `/api/users` - Get all users (with optional `?includePostCount=true`)
- **GET** `/api/users/:id` - Get user by ID
- **GET** `/api/users/email/:email` - Get user by email
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

#### Post Management API
- **GET** `/api/posts` - Get all posts (with optional filters: `?published=true&authorId=xxx&search=term`)
- **GET** `/api/posts/:id` - Get post by ID
- **GET** `/api/posts/author/:authorId` - Get posts by author
- **GET** `/api/posts/published` - Get only published posts
- **POST** `/api/posts` - Create new post
- **PUT** `/api/posts/:id` - Update post
- **DELETE** `/api/posts/:id` - Delete post
- **PATCH** `/api/posts/:id/toggle-publish` - Toggle post publish status

## 🎯 Features

### User Management
- ✅ **Create Users**: Add new users with email and optional name
- ✅ **List Users**: View all users with post counts and creation dates
- ✅ **Edit Users**: Update user information
- ✅ **Delete Users**: Remove users and all their posts
- ✅ **Search Users**: Find users by name or email
- ✅ **User Validation**: Email validation and duplicate prevention

### Post Management
- ✅ **Create Posts**: Write new posts with title, content, and author
- ✅ **List Posts**: View all posts with author information
- ✅ **Edit Posts**: Update post content and status
- ✅ **Delete Posts**: Remove posts permanently
- ✅ **Publish/Draft**: Toggle post visibility status
- ✅ **Filter Posts**: Filter by author, publication status, or search terms
- ✅ **Search Posts**: Full-text search in titles and content

### Frontend Features
- 🎨 **Modern UI**: Clean, responsive design with hover effects
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Real-time Updates**: Instant feedback for all operations
- 🔍 **Advanced Filtering**: Multiple filter options for both users and posts
- 📊 **Statistics**: Live counts and metrics
- ✨ **Form Validation**: Client-side validation with error messages
- 🎯 **User Experience**: Intuitive navigation and clear action buttons

### Backend Features
- 🔒 **Type Safety**: Full TypeScript integration with Prisma
- 🛡️ **Error Handling**: Comprehensive error responses
- 📝 **Input Validation**: Server-side validation for all endpoints
- 🔗 **Relationships**: Proper user-post relationships
- 🔍 **Advanced Queries**: Search, filtering, and pagination support
- ⚡ **Performance**: Efficient database queries with optimized includes

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nx_serverless_db?schema=public"

# Node Environment
NODE_ENV="development"

# Server Configuration
HOST="localhost"
PORT=3000
```

### 3. Database Setup (Optional)

If you want to use the database features:

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations (for development)
pnpm db:migrate

# Or push schema changes directly (for development)
pnpm db:push

# Open Prisma Studio (optional)
pnpm db:studio
```

## 🏃‍♂️ Development

### Start Both Applications

```bash
# Start backend (Express server)
pnpm dev:backend

# Or start backend in serverless mode
pnpm dev:backend:serverless

# In another terminal, start frontend (React app)
pnpm dev:frontend
```

### Code Quality

```bash
# Lint both backend and frontend
pnpm lint

# Lint individual projects
pnpm lint:backend                  
pnpm lint:frontend                 
pnpm lint:all                     # All projects including e2e

# Auto-fix linting issues
pnpm lint:fix                     # Both backend and frontend
pnpm lint:fix:backend             # Backend only
pnpm lint:fix:frontend            # Frontend only

# Format code
pnpm format                       # Format all files
pnpm format:check                 # Check if files are formatted
```

### Individual Commands

```bash
# Backend development server (Express)
pnpm dev:backend                   # http://localhost:3000
# or: nx serve backend

# Backend serverless offline (Lambda simulation)
nx run backend:serve:serverless    # http://localhost:3000

# Frontend development server
pnpm dev:frontend                  # http://localhost:4200
# or: nx serve frontend

# Access the application
# - Home page: http://localhost:4200
# - User management: http://localhost:4200/users
# - Post management: http://localhost:4200/posts

# Build applications
pnpm build:backend                 # Build backend only
pnpm build:frontend                # Build frontend only
# or: nx build backend / nx build frontend

# Run tests
pnpm test:backend                  # Test backend only
pnpm test:frontend                 # Test frontend only
# or: nx test backend / nx test frontend

# Run linting
pnpm lint                          # Lint both backend and frontend
pnpm lint:backend                  # Lint backend only
pnpm lint:frontend                 # Lint frontend only
pnpm lint:all                      # Lint all projects (including e2e)

# Run linting with auto-fix
pnpm lint:fix                      # Lint and fix both backend and frontend
pnpm lint:fix:backend              # Lint and fix backend only
pnpm lint:fix:frontend             # Lint and fix frontend only

# Format code
pnpm format
```

## 📖 Usage Guide

### Getting Started with User and Post Management

1. **Start the Development Servers**
   ```bash
   # Terminal 1: Start the backend
   pnpm dev:backend
   
   # Terminal 2: Start the frontend
   pnpm dev:frontend
   ```

2. **Access the Application**
   - Open http://localhost:4200 in your browser
   - Navigate to "Users" to manage users
   - Navigate to "Posts" to manage posts

### User Management Workflow

1. **Create Your First User**
   - Go to http://localhost:4200/users
   - Click "➕ Add User"
   - Enter email (required) and name (optional)
   - Click "Create User"

2. **Manage Users**
   - **View**: See all users with their post counts and creation dates
   - **Search**: Use the search box to find users by name or email
   - **Edit**: Click "✏️ Edit" to modify user information
   - **Delete**: Click "🗑️ Delete" to remove a user (this also deletes all their posts)
   - **View Posts**: Click "📝 Posts" to see posts by that user

### Post Management Workflow

1. **Create Your First Post**
   - Go to http://localhost:4200/posts
   - Click "➕ Add Post" (you need at least one user first)
   - Enter title (required), content (optional), and select an author
   - Choose whether to publish immediately or save as draft
   - Click "Create Post"

2. **Manage Posts**
   - **View**: See all posts with author information and status
   - **Filter**: Use filters to show only published posts, drafts, or posts by specific authors
   - **Search**: Search posts by title or content
   - **Edit**: Click "✏️ Edit" to modify post content
   - **Publish/Unpublish**: Click "🚀 Publish" or "👁️ Unpublish" to toggle status
   - **Delete**: Click "🗑️ Delete" to remove a post permanently

### API Usage Examples

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "name": "John Doe"}'

# Get all users with post counts
curl http://localhost:3000/api/users?includePostCount=true

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Post", "content": "Hello world!", "authorId": "user-id", "published": true}'

# Search posts
curl http://localhost:3000/api/posts?search=hello&published=true

# Toggle post publish status
curl -X PATCH http://localhost:3000/api/posts/post-id/toggle-publish
```

## 📦 Deployment

### Backend Deployment (AWS Lambda)

1. Configure AWS credentials
2. Update `apps/backend/serverless.yml` with your settings
3. Deploy:

```bash
nx run backend:deploy
```

### Frontend Deployment

Build the frontend and deploy to your preferred hosting service:

```bash
nx build frontend
# Deploy dist/apps/frontend to your hosting provider
```

## 🧪 Testing

```bash
# Unit tests
nx test backend
nx test frontend

# E2E tests
nx e2e frontend-e2e

# Test affected projects only
nx affected:test
```

## 📝 Available Scripts

```bash
# Development
pnpm dev:backend       # Start backend development server
pnpm dev:frontend      # Start frontend development server

# Building
pnpm build            # Build all applications
pnpm build:backend    # Build backend only
pnpm build:frontend   # Build frontend only

# Testing
pnpm test            # Run all tests
pnpm test:backend    # Test backend only
pnpm test:frontend   # Test frontend only

# Linting & Formatting
pnpm lint                 # Lint both backend and frontend
pnpm lint:backend         # Lint backend only  
pnpm lint:frontend        # Lint frontend only
pnpm lint:all            # Lint all projects (including e2e)
pnpm lint:fix            # Lint and auto-fix both backend and frontend
pnpm lint:fix:backend    # Lint and auto-fix backend only
pnpm lint:fix:frontend   # Lint and auto-fix frontend only
pnpm format              # Format all files
pnpm format:check        # Check formatting

# Database
pnpm db:generate     # Generate Prisma client
pnpm db:migrate      # Run database migrations
pnpm db:push         # Push schema changes to database
pnpm db:studio       # Open Prisma Studio
```

## 🔧 Configuration

### Backend Configuration

- **Express.js**: Configured in `apps/backend/src/app.ts`
- **Serverless**: Configuration in `apps/backend/serverless.yml`
- **Prisma**: Schema in `apps/backend/prisma/schema.prisma`

### Frontend Configuration

- **Vite**: Configuration in `apps/frontend/vite.config.ts`
- **React Router**: Routing setup in `apps/frontend/src/app/app.tsx`

### Workspace Configuration

- **Nx**: Configuration in `nx.json`
- **TypeScript**: Base config in `tsconfig.base.json`
- **ESLint**: Configuration in `.eslintrc.json`
- **Prettier**: Configuration in `.prettierrc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in your .env file
   - Run `pnpm db:generate`

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes: `pkill -f node`

3. **Build Errors**
   - Clear Nx cache: `nx reset`
   - Delete node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Getting Help

- Check the [Nx Documentation](https://nx.dev)
- Review [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- Consult [Prisma Documentation](https://www.prisma.io/docs)

---

Built with ❤️ using Nx, React, Express.js, and Serverless Framework
