# Masterlist - Project Management & Analytics Platform

A comprehensive project management and analytics platform built with Next.js 15, featuring real-time collaboration, AI-powered insights, and advanced analytics.

## Features

- 🚀 **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- 🔐 **Authentication**: JWT-based auth with secure HTTP-only cookies
- 💾 **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- 📊 **Analytics Dashboard**: Real-time metrics and visualizations
- 🤝 **Team Collaboration**: Real-time updates, comments, and activity tracking
- 🤖 **AI Insights**: Intelligent project analysis and recommendations
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🌙 **Dark Mode**: Full theme support
- 📄 **Export Functionality**: Export data in multiple formats (CSV, JSON, XLSX, PDF)
- 🔍 **Advanced Search**: Full-text search with filters and sorting

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm 10+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/masterlist.git
cd masterlist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.nextjs.example .env
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. (Optional) Seed the database:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

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
- **Database**: Prisma ORM, SQLite
- **Authentication**: JWT, bcrypt
- **State Management**: React Query, Zustand
- **Charts**: Recharts, Chart.js
- **Real-time**: Polling-based updates (WebSocket ready)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name your-migration-name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
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