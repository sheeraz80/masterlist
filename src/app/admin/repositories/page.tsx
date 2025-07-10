import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RepositoryBatchMonitor } from '@/components/admin/repository-batch-monitor';

export default async function AdminRepositoriesPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
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