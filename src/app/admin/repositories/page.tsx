import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RepositoryBatchMonitor } from '@/components/admin/repository-batch-monitor';
import { prisma } from '@/lib/prisma';

export default async function AdminRepositoriesPage() {
  // Simple auth check - verify the auth token
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');
  
  if (!authToken) {
    redirect('/login');
  }
  
  // Verify the token belongs to admin
  try {
    const session = await prisma.session.findUnique({
      where: { token: authToken.value },
      include: { user: true }
    });
    
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Repository Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage batch creation of repositories for all projects
        </p>
      </div>
      
      <RepositoryBatchMonitor />
    </div>
  );
}