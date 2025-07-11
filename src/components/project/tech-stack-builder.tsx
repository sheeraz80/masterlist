'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Check, Info, Sparkles, Package, Code,
  Database, Cloud, Lock, Zap, Globe, Cpu, Server, GitBranch,
  TestTube, Shield, FileCode, Layers, Workflow, ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Comprehensive tech stack database
export const TECH_STACK_DB = {
  frontend: {
    frameworks: [
      { id: 'nextjs', name: 'Next.js', version: '15.0.0', icon: '⚡', category: 'React Framework' },
      { id: 'remix', name: 'Remix', version: '2.11.0', icon: '💿', category: 'React Framework' },
      { id: 'nuxt', name: 'Nuxt', version: '3.13.0', icon: '💚', category: 'Vue Framework' },
      { id: 'sveltekit', name: 'SvelteKit', version: '2.0.0', icon: '🔥', category: 'Svelte Framework' },
      { id: 'astro', name: 'Astro', version: '4.0.0', icon: '🚀', category: 'Static Site Generator' },
      { id: 'gatsby', name: 'Gatsby', version: '5.13.0', icon: '🟣', category: 'Static Site Generator' },
      { id: 'react', name: 'React', version: '19.0.0', icon: '⚛️', category: 'UI Library' },
      { id: 'vue', name: 'Vue', version: '3.4.0', icon: '💚', category: 'UI Framework' },
      { id: 'angular', name: 'Angular', version: '18.0.0', icon: '🔺', category: 'UI Framework' },
      { id: 'solid', name: 'SolidJS', version: '1.8.0', icon: '🔷', category: 'UI Library' },
      { id: 'qwik', name: 'Qwik', version: '1.5.0', icon: '⚡', category: 'UI Framework' }
    ],
    styling: [
      { id: 'tailwind', name: 'Tailwind CSS', version: '4.0.0', icon: '🎨', category: 'Utility-First CSS' },
      { id: 'unocss', name: 'UnoCSS', version: '0.61.0', icon: '🎯', category: 'Atomic CSS' },
      { id: 'styled-components', name: 'Styled Components', version: '6.1.0', icon: '💅', category: 'CSS-in-JS' },
      { id: 'emotion', name: 'Emotion', version: '11.13.0', icon: '👩‍🎤', category: 'CSS-in-JS' },
      { id: 'stitches', name: 'Stitches', version: '1.2.8', icon: '🪡', category: 'CSS-in-JS' },
      { id: 'vanilla-extract', name: 'Vanilla Extract', version: '1.15.0', icon: '🍦', category: 'CSS-in-TS' },
      { id: 'sass', name: 'Sass', version: '1.77.0', icon: '💖', category: 'CSS Preprocessor' },
      { id: 'postcss', name: 'PostCSS', version: '8.4.0', icon: '🔧', category: 'CSS Tool' }
    ],
    ui: [
      { id: 'shadcn', name: 'shadcn/ui', version: 'latest', icon: '🎨', category: 'Component Library' },
      { id: 'radix', name: 'Radix UI', version: '1.1.0', icon: '◼️', category: 'Headless UI' },
      { id: 'headlessui', name: 'Headless UI', version: '2.1.0', icon: '🎭', category: 'Headless UI' },
      { id: 'mantine', name: 'Mantine', version: '7.12.0', icon: '💙', category: 'Component Library' },
      { id: 'mui', name: 'Material UI', version: '6.0.0', icon: '🟦', category: 'Component Library' },
      { id: 'antd', name: 'Ant Design', version: '5.20.0', icon: '🐜', category: 'Component Library' },
      { id: 'chakra', name: 'Chakra UI', version: '3.0.0', icon: '⚡', category: 'Component Library' },
      { id: 'ark', name: 'Ark UI', version: '3.0.0', icon: '🏛️', category: 'Headless UI' }
    ],
    state: [
      { id: 'tanstack-query', name: 'TanStack Query', version: '5.51.0', icon: '🔄', category: 'Server State' },
      { id: 'swr', name: 'SWR', version: '2.2.0', icon: '🔁', category: 'Data Fetching' },
      { id: 'zustand', name: 'Zustand', version: '4.5.0', icon: '🐻', category: 'State Management' },
      { id: 'jotai', name: 'Jotai', version: '2.9.0', icon: '👻', category: 'Atomic State' },
      { id: 'valtio', name: 'Valtio', version: '2.0.0', icon: '🧙', category: 'Proxy State' },
      { id: 'redux-toolkit', name: 'Redux Toolkit', version: '2.2.0', icon: '🟣', category: 'State Management' },
      { id: 'mobx', name: 'MobX', version: '6.13.0', icon: '🔮', category: 'State Management' },
      { id: 'xstate', name: 'XState', version: '5.17.0', icon: '🤖', category: 'State Machines' },
      { id: 'legend-state', name: 'Legend State', version: '3.0.0', icon: '⚡', category: 'State Management' }
    ],
    bundlers: [
      { id: 'vite', name: 'Vite', version: '5.3.0', icon: '⚡', category: 'Build Tool' },
      { id: 'turbopack', name: 'Turbopack', version: '2.0.0', icon: '🟦', category: 'Build Tool' },
      { id: 'webpack', name: 'Webpack', version: '5.93.0', icon: '📦', category: 'Bundler' },
      { id: 'rspack', name: 'Rspack', version: '1.0.0', icon: '🦀', category: 'Rust Bundler' },
      { id: 'esbuild', name: 'esbuild', version: '0.23.0', icon: '⚡', category: 'Bundler' },
      { id: 'rollup', name: 'Rollup', version: '4.20.0', icon: '📦', category: 'Bundler' },
      { id: 'parcel', name: 'Parcel', version: '2.12.0', icon: '📦', category: 'Zero-Config Bundler' },
      { id: 'bun', name: 'Bun', version: '1.1.0', icon: '🥟', category: 'Runtime & Bundler' }
    ]
  },
  backend: {
    runtime: [
      { id: 'nodejs', name: 'Node.js', version: '22.0.0', icon: '💚', category: 'JavaScript Runtime' },
      { id: 'deno', name: 'Deno', version: '2.0.0', icon: '🦕', category: 'TypeScript Runtime' },
      { id: 'bun', name: 'Bun', version: '1.1.0', icon: '🥟', category: 'JS/TS Runtime' },
      { id: 'python', name: 'Python', version: '3.12', icon: '🐍', category: 'Language' },
      { id: 'go', name: 'Go', version: '1.23', icon: '🐹', category: 'Language' },
      { id: 'rust', name: 'Rust', version: '1.80', icon: '🦀', category: 'Language' },
      { id: 'java', name: 'Java', version: '22', icon: '☕', category: 'Language' },
      { id: 'dotnet', name: '.NET', version: '9.0', icon: '🟦', category: 'Platform' }
    ],
    frameworks: [
      { id: 'express', name: 'Express', version: '4.21.0', icon: '🚂', category: 'Node.js Framework' },
      { id: 'fastify', name: 'Fastify', version: '4.28.0', icon: '🚀', category: 'Node.js Framework' },
      { id: 'hono', name: 'Hono', version: '4.5.0', icon: '🔥', category: 'Edge Framework' },
      { id: 'koa', name: 'Koa', version: '2.15.0', icon: '🏗️', category: 'Node.js Framework' },
      { id: 'nestjs', name: 'NestJS', version: '10.4.0', icon: '🐱', category: 'Node.js Framework' },
      { id: 'adonis', name: 'AdonisJS', version: '6.0.0', icon: '🟣', category: 'Node.js Framework' },
      { id: 'fastapi', name: 'FastAPI', version: '0.112.0', icon: '⚡', category: 'Python Framework' },
      { id: 'django', name: 'Django', version: '5.1.0', icon: '🟢', category: 'Python Framework' },
      { id: 'flask', name: 'Flask', version: '3.0.0', icon: '🍶', category: 'Python Framework' },
      { id: 'gin', name: 'Gin', version: '1.10.0', icon: '🍸', category: 'Go Framework' },
      { id: 'fiber', name: 'Fiber', version: '3.0.0', icon: '🚀', category: 'Go Framework' },
      { id: 'actix', name: 'Actix Web', version: '4.8.0', icon: '🦀', category: 'Rust Framework' },
      { id: 'axum', name: 'Axum', version: '0.7.0', icon: '🦀', category: 'Rust Framework' },
      { id: 'spring', name: 'Spring Boot', version: '3.3.0', icon: '🍃', category: 'Java Framework' }
    ],
    api: [
      { id: 'rest', name: 'REST API', version: 'latest', icon: '🔌', category: 'API Style' },
      { id: 'graphql', name: 'GraphQL', version: '16.9.0', icon: '◼️', category: 'API Query Language' },
      { id: 'trpc', name: 'tRPC', version: '11.0.0', icon: '🔷', category: 'TypeSafe RPC' },
      { id: 'grpc', name: 'gRPC', version: '1.65.0', icon: '🔄', category: 'RPC Framework' },
      { id: 'websocket', name: 'WebSockets', version: 'latest', icon: '🔌', category: 'Real-time' },
      { id: 'sse', name: 'Server-Sent Events', version: 'latest', icon: '📡', category: 'Real-time' }
    ],
    auth: [
      { id: 'auth0', name: 'Auth0', version: 'latest', icon: '🔐', category: 'Auth Service' },
      { id: 'clerk', name: 'Clerk', version: 'latest', icon: '🔒', category: 'Auth Service' },
      { id: 'supabase-auth', name: 'Supabase Auth', version: 'latest', icon: '⚡', category: 'Auth Service' },
      { id: 'firebase-auth', name: 'Firebase Auth', version: 'latest', icon: '🔥', category: 'Auth Service' },
      { id: 'nextauth', name: 'NextAuth.js', version: '5.0.0', icon: '🔐', category: 'Auth Library' },
      { id: 'lucia', name: 'Lucia', version: '3.0.0', icon: '🔑', category: 'Auth Library' },
      { id: 'passport', name: 'Passport.js', version: '0.7.0', icon: '📘', category: 'Auth Middleware' }
    ]
  },
  database: {
    sql: [
      { id: 'postgresql', name: 'PostgreSQL', version: '16', icon: '🐘', category: 'Relational DB' },
      { id: 'mysql', name: 'MySQL', version: '8.4', icon: '🐬', category: 'Relational DB' },
      { id: 'sqlite', name: 'SQLite', version: '3.46', icon: '🗃️', category: 'Embedded DB' },
      { id: 'cockroachdb', name: 'CockroachDB', version: '24.1', icon: '🪳', category: 'Distributed SQL' },
      { id: 'yugabyte', name: 'YugabyteDB', version: '2.20', icon: '🟠', category: 'Distributed SQL' },
      { id: 'tidb', name: 'TiDB', version: '8.1', icon: '🐯', category: 'Distributed SQL' }
    ],
    nosql: [
      { id: 'mongodb', name: 'MongoDB', version: '7.0', icon: '🍃', category: 'Document DB' },
      { id: 'redis', name: 'Redis', version: '7.4', icon: '🟥', category: 'In-Memory DB' },
      { id: 'cassandra', name: 'Cassandra', version: '5.0', icon: '👁️', category: 'Wide Column DB' },
      { id: 'dynamodb', name: 'DynamoDB', version: 'latest', icon: '🔶', category: 'Key-Value DB' },
      { id: 'couchdb', name: 'CouchDB', version: '3.3', icon: '🛋️', category: 'Document DB' }
    ],
    orm: [
      { id: 'prisma', name: 'Prisma', version: '6.0.0', icon: '◼️', category: 'TypeScript ORM' },
      { id: 'drizzle', name: 'Drizzle', version: '0.33.0', icon: '💧', category: 'TypeScript ORM' },
      { id: 'typeorm', name: 'TypeORM', version: '0.3.20', icon: '🔷', category: 'TypeScript ORM' },
      { id: 'mikro-orm', name: 'MikroORM', version: '6.3.0', icon: '🔬', category: 'TypeScript ORM' },
      { id: 'sequelize', name: 'Sequelize', version: '6.37.0', icon: '🌿', category: 'JavaScript ORM' },
      { id: 'sqlalchemy', name: 'SQLAlchemy', version: '2.0', icon: '⚗️', category: 'Python ORM' },
      { id: 'gorm', name: 'GORM', version: '1.25', icon: '🐹', category: 'Go ORM' },
      { id: 'diesel', name: 'Diesel', version: '2.2', icon: '🦀', category: 'Rust ORM' }
    ],
    vector: [
      { id: 'pinecone', name: 'Pinecone', version: 'latest', icon: '🌲', category: 'Vector DB' },
      { id: 'weaviate', name: 'Weaviate', version: '1.26', icon: '🟢', category: 'Vector DB' },
      { id: 'qdrant', name: 'Qdrant', version: '1.10', icon: '🔷', category: 'Vector DB' },
      { id: 'milvus', name: 'Milvus', version: '2.4', icon: '🔵', category: 'Vector DB' },
      { id: 'chroma', name: 'Chroma', version: '0.5', icon: '🌈', category: 'Vector DB' }
    ]
  },
  devops: {
    containerization: [
      { id: 'docker', name: 'Docker', version: '26.1', icon: '🐳', category: 'Container Platform' },
      { id: 'podman', name: 'Podman', version: '5.1', icon: '🦭', category: 'Container Platform' },
      { id: 'containerd', name: 'containerd', version: '1.7', icon: '📦', category: 'Container Runtime' }
    ],
    orchestration: [
      { id: 'kubernetes', name: 'Kubernetes', version: '1.31', icon: '☸️', category: 'Container Orchestration' },
      { id: 'k3s', name: 'K3s', version: '1.30', icon: '🚢', category: 'Lightweight K8s' },
      { id: 'nomad', name: 'Nomad', version: '1.8', icon: '🏕️', category: 'Orchestrator' },
      { id: 'swarm', name: 'Docker Swarm', version: 'latest', icon: '🐝', category: 'Orchestration' }
    ],
    cicd: [
      { id: 'github-actions', name: 'GitHub Actions', version: 'latest', icon: '🔷', category: 'CI/CD' },
      { id: 'gitlab-ci', name: 'GitLab CI', version: 'latest', icon: '🦊', category: 'CI/CD' },
      { id: 'jenkins', name: 'Jenkins', version: '2.462', icon: '🎩', category: 'CI/CD' },
      { id: 'circleci', name: 'CircleCI', version: 'latest', icon: '🟢', category: 'CI/CD' },
      { id: 'buildkite', name: 'Buildkite', version: 'latest', icon: '🏗️', category: 'CI/CD' }
    ],
    monitoring: [
      { id: 'prometheus', name: 'Prometheus', version: '2.53', icon: '🔥', category: 'Metrics' },
      { id: 'grafana', name: 'Grafana', version: '11.1', icon: '📊', category: 'Visualization' },
      { id: 'datadog', name: 'Datadog', version: 'latest', icon: '🐕', category: 'APM' },
      { id: 'sentry', name: 'Sentry', version: 'latest', icon: '🛡️', category: 'Error Tracking' },
      { id: 'opentelemetry', name: 'OpenTelemetry', version: '1.26', icon: '📡', category: 'Observability' }
    ]
  },
  cloud: {
    providers: [
      { id: 'aws', name: 'AWS', version: 'latest', icon: '🟠', category: 'Cloud Provider' },
      { id: 'gcp', name: 'Google Cloud', version: 'latest', icon: '🔵', category: 'Cloud Provider' },
      { id: 'azure', name: 'Azure', version: 'latest', icon: '🔷', category: 'Cloud Provider' },
      { id: 'vercel', name: 'Vercel', version: 'latest', icon: '▲', category: 'Edge Platform' },
      { id: 'netlify', name: 'Netlify', version: 'latest', icon: '🟢', category: 'JAMstack Platform' },
      { id: 'cloudflare', name: 'Cloudflare', version: 'latest', icon: '🟠', category: 'Edge Platform' },
      { id: 'fly', name: 'Fly.io', version: 'latest', icon: '🚁', category: 'Edge Platform' },
      { id: 'railway', name: 'Railway', version: 'latest', icon: '🚂', category: 'App Platform' }
    ],
    services: [
      { id: 's3', name: 'AWS S3', version: 'latest', icon: '🪣', category: 'Object Storage' },
      { id: 'cloudflare-r2', name: 'Cloudflare R2', version: 'latest', icon: '🟠', category: 'Object Storage' },
      { id: 'lambda', name: 'AWS Lambda', version: 'latest', icon: 'λ', category: 'Serverless' },
      { id: 'workers', name: 'Cloudflare Workers', version: 'latest', icon: '⚡', category: 'Edge Functions' },
      { id: 'functions', name: 'Vercel Functions', version: 'latest', icon: '▲', category: 'Serverless' }
    ]
  },
  testing: {
    unit: [
      { id: 'vitest', name: 'Vitest', version: '2.0.0', icon: '⚡', category: 'Test Runner' },
      { id: 'jest', name: 'Jest', version: '29.7', icon: '🃏', category: 'Test Runner' },
      { id: 'node-test', name: 'Node Test Runner', version: 'built-in', icon: '💚', category: 'Test Runner' },
      { id: 'mocha', name: 'Mocha', version: '10.7', icon: '☕', category: 'Test Framework' },
      { id: 'ava', name: 'AVA', version: '6.1', icon: '🚀', category: 'Test Runner' }
    ],
    e2e: [
      { id: 'playwright', name: 'Playwright', version: '1.45', icon: '🎭', category: 'E2E Testing' },
      { id: 'cypress', name: 'Cypress', version: '13.13', icon: '🌲', category: 'E2E Testing' },
      { id: 'webdriver', name: 'WebdriverIO', version: '9.0', icon: '🚗', category: 'E2E Testing' },
      { id: 'puppeteer', name: 'Puppeteer', version: '22.15', icon: '🎪', category: 'Browser Automation' }
    ],
    tools: [
      { id: 'msw', name: 'MSW', version: '2.3', icon: '🔧', category: 'API Mocking' },
      { id: 'testing-library', name: 'Testing Library', version: '16.0', icon: '🐙', category: 'Testing Utils' },
      { id: 'storybook', name: 'Storybook', version: '8.2', icon: '📖', category: 'Component Testing' },
      { id: 'chromatic', name: 'Chromatic', version: 'latest', icon: '🎨', category: 'Visual Testing' }
    ]
  },
  ai: [
    { id: 'openai', name: 'OpenAI', version: 'latest', icon: '🤖', category: 'LLM Provider' },
    { id: 'anthropic', name: 'Anthropic', version: 'latest', icon: '🧠', category: 'LLM Provider' },
    { id: 'langchain', name: 'LangChain', version: '0.2', icon: '🔗', category: 'LLM Framework' },
    { id: 'llamaindex', name: 'LlamaIndex', version: '0.10', icon: '🦙', category: 'LLM Framework' },
    { id: 'huggingface', name: 'Hugging Face', version: 'latest', icon: '🤗', category: 'ML Platform' },
    { id: 'tensorflow', name: 'TensorFlow', version: '2.17', icon: '🧠', category: 'ML Framework' },
    { id: 'pytorch', name: 'PyTorch', version: '2.4', icon: '🔥', category: 'ML Framework' },
    { id: 'transformers', name: 'Transformers', version: '4.44', icon: '🤖', category: 'NLP Library' }
  ]
};

interface TechStackBuilderProps {
  selectedStack: Record<string, string[]>;
  onStackChange: (stack: Record<string, string[]>) => void;
  presets?: {
    name: string;
    stack: Record<string, string[]>;
  }[];
}

export function TechStackBuilder({ selectedStack, onStackChange, presets }: TechStackBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('frontend');
  const [showPresets, setShowPresets] = useState(true);

  const categories = Object.keys(TECH_STACK_DB);

  const handleToggleTech = (category: string, techId: string) => {
    const currentStack = selectedStack[category] || [];
    const newStack = currentStack.includes(techId)
      ? currentStack.filter(id => id !== techId)
      : [...currentStack, techId];
    
    onStackChange({
      ...selectedStack,
      [category]: newStack
    });
  };

  const handleApplyPreset = (preset: Record<string, string[]>) => {
    onStackChange(preset);
  };

  const getSelectedCount = () => {
    return Object.values(selectedStack).reduce((sum, techs) => sum + techs.length, 0);
  };

  const filteredTechs = (category: string, subcategory: string) => {
    const techs = TECH_STACK_DB[category as keyof typeof TECH_STACK_DB][subcategory as any] || [];
    if (!searchTerm) return techs;
    
    return techs.filter(tech => 
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Common presets
  const defaultPresets = [
    {
      name: 'Modern Full-Stack',
      icon: '🚀',
      description: 'Next.js + TypeScript + Tailwind + Prisma',
      stack: {
        frontend: ['nextjs', 'tailwind', 'shadcn', 'tanstack-query'],
        backend: ['nodejs', 'express', 'trpc'],
        database: ['postgresql', 'prisma', 'redis'],
        devops: ['docker', 'github-actions'],
        testing: ['vitest', 'playwright', 'msw']
      }
    },
    {
      name: 'AI-Powered App',
      icon: '🤖',
      description: 'FastAPI + LangChain + React + Vector DB',
      stack: {
        frontend: ['react', 'vite', 'tailwind', 'tanstack-query'],
        backend: ['python', 'fastapi', 'websocket'],
        database: ['postgresql', 'pinecone', 'redis'],
        ai: ['openai', 'langchain', 'transformers'],
        devops: ['docker', 'kubernetes']
      }
    },
    {
      name: 'Enterprise Stack',
      icon: '🏢',
      description: 'Angular + Spring Boot + PostgreSQL',
      stack: {
        frontend: ['angular', 'mui', 'sass'],
        backend: ['java', 'spring', 'grpc'],
        database: ['postgresql', 'redis'],
        devops: ['kubernetes', 'jenkins', 'prometheus'],
        testing: ['jest', 'cypress']
      }
    },
    {
      name: 'Serverless Edge',
      icon: '⚡',
      description: 'SvelteKit + Cloudflare Workers + D1',
      stack: {
        frontend: ['sveltekit', 'tailwind'],
        backend: ['workers', 'hono'],
        database: ['sqlite', 'drizzle'],
        cloud: ['cloudflare', 'cloudflare-r2'],
        testing: ['vitest', 'playwright']
      }
    }
  ];

  const stackPresets = presets || defaultPresets;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search technologies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {getSelectedCount()} technologies selected
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStackChange({})}
          disabled={getSelectedCount() === 0}
        >
          Clear All
        </Button>
      </div>

      <Tabs value={showPresets ? 'presets' : 'custom'} onValueChange={(v) => setShowPresets(v === 'presets')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom Stack</TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-3">
          {stackPresets.map((preset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleApplyPreset(preset.stack)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{preset.icon}</span>
                        <h4 className="font-semibold">{preset.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preset.stack).map(([category, techs]) => (
                          techs.map(techId => {
                            const tech = Object.values(TECH_STACK_DB[category as keyof typeof TECH_STACK_DB] || {})
                              .flat()
                              .find((t: any) => t.id === techId);
                            return tech ? (
                              <Badge key={techId} variant="secondary" className="text-xs">
                                {tech.name}
                              </Badge>
                            ) : null;
                          })
                        ))}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Custom Stack Tab */}
        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Category Sidebar */}
            <div className="col-span-3">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? 'secondary' : 'ghost'}
                      className="w-full justify-start capitalize"
                      onClick={() => setActiveCategory(category)}
                    >
                      {getCategoryIcon(category)}
                      <span className="ml-2">{category}</span>
                      {selectedStack[category]?.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {selectedStack[category].length}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Technology Grid */}
            <div className="col-span-9">
              <ScrollArea className="h-[500px]">
                <Accordion type="single" collapsible className="space-y-2">
                  {Object.entries(TECH_STACK_DB[activeCategory as keyof typeof TECH_STACK_DB] || {}).map(([subcategory, techs]) => (
                    <AccordionItem key={subcategory} value={subcategory}>
                      <AccordionTrigger className="capitalize">
                        {subcategory.replace(/_/g, ' ')}
                        <Badge variant="outline" className="ml-2">
                          {(techs as any[]).length}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {filteredTechs(activeCategory, subcategory).map((tech: any) => {
                            const isSelected = selectedStack[activeCategory]?.includes(tech.id);
                            return (
                              <motion.div
                                key={tech.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  className={cn(
                                    "cursor-pointer transition-all",
                                    isSelected && "ring-2 ring-primary"
                                  )}
                                  onClick={() => handleToggleTech(activeCategory, tech.id)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{tech.icon}</span>
                                        <div>
                                          <p className="font-medium text-sm">{tech.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {tech.version} • {tech.category}
                                          </p>
                                        </div>
                                      </div>
                                      <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                      )}>
                                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </div>
          </div>

          {/* Selected Technologies Summary */}
          {getSelectedCount() > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Your Custom Stack
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedStack).map(([category, techIds]) => {
                    if (techIds.length === 0) return null;
                    return (
                      <div key={category} className="flex items-start gap-2">
                        <Badge variant="outline" className="capitalize min-w-24">
                          {category}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {techIds.map(techId => {
                            const tech = Object.values(TECH_STACK_DB[category as keyof typeof TECH_STACK_DB] || {})
                              .flat()
                              .find((t: any) => t.id === techId);
                            return tech ? (
                              <Badge key={techId} variant="secondary" className="text-xs">
                                {tech.icon} {tech.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getCategoryIcon(category: string) {
  const icons: Record<string, JSX.Element> = {
    frontend: <Globe className="h-4 w-4" />,
    backend: <Server className="h-4 w-4" />,
    database: <Database className="h-4 w-4" />,
    devops: <Workflow className="h-4 w-4" />,
    cloud: <Cloud className="h-4 w-4" />,
    testing: <TestTube className="h-4 w-4" />,
    ai: <Cpu className="h-4 w-4" />
  };
  return icons[category] || <Package className="h-4 w-4" />;
}