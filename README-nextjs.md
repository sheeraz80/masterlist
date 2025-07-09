# Masterlist - Next.js Project Management Platform

A comprehensive project management and analytics platform built with Next.js 15.3, TypeScript, and modern web technologies.

## 🚀 Features

- **Project Management**: Organize and track innovative project ideas
- **Advanced Analytics**: Comprehensive reporting and insights
- **Smart Search**: AI-powered search and filtering capabilities
- **Collaboration Tools**: Team workspaces and project sharing
- **Modern UI**: Beautiful, responsive interface with dark/light mode
- **Type-Safe**: Built with TypeScript for better developer experience

## 🛠 Tech Stack

- **Framework**: Next.js 15.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (ready for integration)
- **Database**: JSON-based (easily migrable to any database)

## 📦 Installation

### Prerequisites

- Node.js 20+ 
- npm 10+

### Local Development

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Docker Setup

1. **Development with Docker**:
   ```bash
   docker-compose -f docker-compose.nextjs.yml --profile dev up
   ```

2. **Production with Docker**:
   ```bash
   docker-compose -f docker-compose.nextjs.yml up
   ```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── projects/          # Project pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── header.tsx        # Navigation header
│   ├── stats-cards.tsx   # Dashboard stats
│   └── ...
├── lib/                  # Utilities and configurations
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks

data/
└── projects.json         # Project data (JSON format)
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run analyze` - Bundle size analysis

## 📊 API Endpoints

- `GET /api/stats` - Dashboard statistics
- `GET /api/projects` - List projects with filtering
- `GET /api/projects/[id]` - Get specific project details

## 🌟 Key Features

### Dashboard
- Project statistics and metrics
- Interactive charts and visualizations
- Recent projects overview
- Quality score distributions

### Project Management
- Comprehensive project listing
- Advanced search and filtering
- Detailed project views
- Revenue potential analysis

### Modern UI/UX
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Accessible components

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Docker Production
```bash
docker build -f Dockerfile.nextjs -t masterlist-nextjs .
docker run -p 3000:3000 masterlist-nextjs
```

### Traditional Hosting
```bash
npm run build
npm start
```

## 🔄 Migration from Python/Flask

This project was successfully migrated from a Python/Flask backend to a modern Next.js full-stack application. The migration included:

- ✅ Complete UI rebuild with modern React components
- ✅ API routes converted from Flask to Next.js API routes  
- ✅ Data structure maintained for compatibility
- ✅ All analytics and dashboard features preserved
- ✅ Docker configuration updated for Node.js
- ✅ TypeScript for improved developer experience

## 📈 Performance

- **Bundle Size**: Optimized with Next.js automatic splitting
- **Loading**: Server-side rendering for faster initial loads
- **Caching**: React Query for intelligent data fetching
- **Images**: Next.js Image optimization
- **Build**: Standalone output for efficient Docker deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🔗 Access the Application

After starting the development server, you can access:

- **Homepage**: `http://localhost:3000` - Dashboard with project statistics
- **Projects**: `http://localhost:3000/projects` - Browse all projects
- **Project Details**: `http://localhost:3000/projects/[id]` - Individual project pages
- **API**: `http://localhost:3000/api/stats` - API endpoints

The application features a modern, responsive interface with:
- Interactive dashboard with charts and statistics
- Project listing with search and filtering
- Detailed project views with revenue analysis
- Dark/light theme toggle
- Mobile-friendly responsive design