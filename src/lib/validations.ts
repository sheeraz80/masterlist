import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  page: z.coerce.number().min(1).optional(),
});

export const searchSchema = z.object({
  search: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'quality', 'complexity', 'revenue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Project schemas
export const projectIdSchema = z.object({
  id: z.string().min(1).max(100),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  problem: z.string().min(1).max(5000),
  solution: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  targetUsers: z.string().max(1000).optional(),
  revenueModel: z.string().max(1000).optional(),
  revenuePotential: z.object({
    conservative: z.number().min(0).optional(),
    realistic: z.number().min(0).optional(),
    optimistic: z.number().min(0).optional(),
  }).optional(),
  developmentTime: z.string().max(100).optional(),
  competitionLevel: z.enum(['Low', 'Medium', 'High']).optional(),
  technicalComplexity: z.number().min(1).max(10).optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  keyFeatures: z.array(z.string()).max(20).optional(),
  tags: z.array(z.string()).max(10).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  progress: z.number().min(0).max(100).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

// User schemas
export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
  }).optional(),
});

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  teamId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['member', 'admin', 'viewer']).default('member'),
});

export const updateProjectStatusSchema = z.object({
  teamId: z.string().min(1),
  projectId: z.string().min(1),
  status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'assigned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Comment schemas
export const addCommentSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().min(1).max(1000),
  type: z.enum(['comment', 'review', 'suggestion']).default('comment'),
  rating: z.number().min(1).max(5).optional(),
});

// Export schemas
export const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx', 'pdf', 'docx']),
  projectIds: z.array(z.string()).optional(),
  filters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    minQuality: z.number().optional(),
    maxQuality: z.number().optional(),
    minComplexity: z.number().optional(),
    maxComplexity: z.number().optional(),
    search: z.string().optional(),
  }).optional(),
  reportType: z.enum(['summary', 'detailed', 'export']).default('export'),
});

// Insights schemas
export const insightsQuerySchema = z.object({
  category: z.string().optional(),
  type: z.enum(['opportunity', 'risk', 'trend', 'recommendation', 'optimization']).optional(),
  min_confidence: z.coerce.number().min(0).max(100).optional(),
});

// Helper function to validate request
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        data: null, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { data: null, error: 'Invalid request body' };
  }
}

// Helper function to validate query params
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T | null; error: string | null } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        data: null, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { data: null, error: 'Invalid query parameters' };
  }
}