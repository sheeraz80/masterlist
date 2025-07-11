import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};

// Helper functions for backward compatibility
export async function getCurrentUser(request?: any) {
  // If request is provided, try to get user from JWT token (for API routes)
  if (request) {
    try {
      // Try to get token from Authorization header
      const authHeader = request.headers.get('authorization');
      let token = authHeader?.replace('Bearer ', '');
      
      // If not in header, try cookies
      if (!token) {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {});
          token = cookies['auth-token'] || cookies['session-token'];
        }
      }
      
      if (token) {
        try {
          // Verify JWT token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
          
          // Get user from database
          const user = await prisma.user.findUnique({
            where: { id: decoded.id }
          });
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            };
          }
        } catch (jwtError) {
          // Invalid token, continue to NextAuth fallback
        }
      }
    } catch (error) {
      // Continue to NextAuth fallback
    }
  }
  
  // Fallback to NextAuth session (for server components)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new Error('Invalid credentials');
  }

  // Create session token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  // Store session
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { user, token };
}

export async function register(email: string, password: string, name: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });

  return user;
}

export async function logout(token: string) {
  await prisma.session.delete({
    where: { token }
  });
}