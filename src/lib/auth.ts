import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken(userId);
  
  // Store session in database
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  });
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    const token = await createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function register(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return null;
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    const token = await createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

export async function logout(token: string): Promise<boolean> {
  try {
    await deleteSession(token);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}