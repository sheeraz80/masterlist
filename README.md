# Masterlist - Project Management & Analytics Platform

A comprehensive project management and analytics platform built with Next.js 15, featuring real-time collaboration, AI-powered insights, and advanced analytics. The platform includes 700+ pre-loaded projects across 15+ categories with detailed analytics and insights.

## Features

- 🚀 **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- 🔐 **Authentication**: JWT-based auth with secure HTTP-only cookies
- 💾 **Database**: PostgreSQL 17 with Prisma ORM
- 📊 **Analytics Dashboard**: Real-time metrics and visualizations
- 🤝 **Team Collaboration**: Real-time updates, comments, and activity tracking
- 🤖 **AI Insights**: Intelligent project analysis and recommendations
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🌙 **Dark Mode**: Full theme support
- 📄 **Export Functionality**: Export data in multiple formats (CSV, JSON, XLSX, PDF)
- 🔍 **Advanced Search**: Full-text search with filters and sorting
- 💼 **700+ Projects**: Pre-loaded with comprehensive project data

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm 10+
- PostgreSQL 17+
- Git

### Quick Setup (Recommended)

We provide an automated setup script that handles everything:

```bash
# Clone the repository
git clone https://github.com/yourusername/masterlist.git
cd masterlist

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Check system requirements
- Install dependencies
- Configure the database
- Load 700+ projects with seed data
- Set up git hooks for automatic backups

### Manual Setup

If you prefer manual setup:

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/masterlist.git
cd masterlist
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL database:**
```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE masterlist;
CREATE USER masterlist_user WITH PASSWORD 'masterlist_password123';
GRANT ALL PRIVILEGES ON DATABASE masterlist TO masterlist_user;
ALTER DATABASE masterlist OWNER TO masterlist_user;
EOF
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials if different
```

5. **Initialize database:**
```bash
npm run setup
```

6. **Start the development server:**
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

### Default Login Credentials

- **Admin User**
  - Email: `admin@masterlist.com`
  - Password: `password123`

- **Demo User**
  - Email: `user@masterlist.com`
  - Password: `password123`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── ...               # Other pages
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── ...               # Other utilities
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Key Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Database**: PostgreSQL 17, Prisma ORM
- **Authentication**: JWT, bcrypt
- **State Management**: React Query, Zustand
- **Charts**: Recharts, Chart.js
- **Real-time**: Socket.io ready
- **Export**: XLSX, PDF, CSV, JSON support

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
npm run db:backup      # Backup database to seed-data
npm run db:reset       # Reset and reseed database

# Setup
npm run setup          # Complete setup (install, generate, push, seed)
npm run setup:fresh    # Fresh setup (reset database first)

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm test              # Run tests
```

### Database Management

The project uses PostgreSQL with automatic backup functionality:

- **Automatic Backups**: Database changes are automatically backed up on git commits
- **Seed Data**: Pre-loaded with 700+ projects across 15+ categories
- **Easy Restoration**: New clones automatically get the full dataset

To manually backup the database:
```bash
npm run db:backup
```

To reset and restore from seed data:
```bash
npm run db:reset
```

## Production Deployment

### Environment Variables

Ensure all required environment variables are set:

- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT signing (use a strong random string)
- `NEXT_PUBLIC_APP_URL` - Your app's URL

### Build and Deploy

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t masterlist .

# Run container
docker run -p 3000:3000 --env-file .env masterlist
```

## API Documentation

The API follows RESTful conventions:

- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

Authentication required for all endpoints except `/api/auth/login` and `/api/auth/register`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All passwords are hashed using bcrypt
- JWT tokens are stored in HTTP-only cookies
- CORS is properly configured
- Input validation on all API endpoints
- SQL injection protection via Prisma

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@masterlist.com or open an issue on GitHub.