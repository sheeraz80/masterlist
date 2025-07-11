import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { prisma } from '@/lib/prisma';
import { GitHubClient } from '@/lib/github';

// Sync all projects with GitHub repositories
export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Get GitHub client
      const githubClient = new GitHubClient(process.env.GITHUB_FULL_ACCESS_TOKEN!);
      
      // Get all repositories from GitHub
      const githubRepos = await githubClient.listRepositories('corevecta-projects');
      
      // Get all projects from database
      const projects = await prisma.project.findMany({
        where: {
          status: 'active'
        },
        select: {
          id: true,
          title: true,
          category: true,
          repository: {
            select: {
              id: true,
              githubName: true
            }
          }
        }
      });

      const results = {
        synced: 0,
        created: 0,
        errors: 0,
        details: [] as any[]
      };

      // For each GitHub repo, check if it exists in our database
      for (const githubRepo of githubRepos) {
        try {
          // Check if repository already exists
          const existingRepo = await prisma.repository.findFirst({
            where: {
              OR: [
                { githubName: githubRepo.name },
                { githubRepoId: githubRepo.id.toString() }
              ]
            }
          });

          if (existingRepo) {
            // Update existing repository
            await prisma.repository.update({
              where: { id: existingRepo.id },
              data: {
                githubUrl: githubRepo.html_url,
                isPrivate: githubRepo.private,
                lastSync: new Date(),
                language: githubRepo.language || undefined,
                lastCommit: githubRepo.pushed_at ? new Date(githubRepo.pushed_at) : undefined
              }
            });
            results.synced++;
            results.details.push({
              action: 'synced',
              repo: githubRepo.name,
              status: 'success'
            });
          } else {
            // Try to match with a project by name similarity
            const matchingProject = projects.find(p => {
              const projectSlug = p.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              return githubRepo.name.toLowerCase().includes(projectSlug) ||
                     projectSlug.includes(githubRepo.name.toLowerCase());
            });

            if (matchingProject && !matchingProject.repository) {
              // Create new repository linked to project
              await prisma.repository.create({
                data: {
                  projectId: matchingProject.id,
                  githubRepoId: githubRepo.id.toString(),
                  githubUrl: githubRepo.html_url,
                  githubOwner: githubRepo.owner.login,
                  githubName: githubRepo.name,
                  isPrivate: githubRepo.private,
                  category: matchingProject.category,
                  repoPath: `${matchingProject.category}/${githubRepo.name}`,
                  status: 'ACTIVE',
                  language: githubRepo.language || undefined,
                  lastSync: new Date(),
                  lastCommit: githubRepo.pushed_at ? new Date(githubRepo.pushed_at) : undefined
                }
              });
              results.created++;
              results.details.push({
                action: 'created',
                repo: githubRepo.name,
                project: matchingProject.title,
                status: 'success'
              });
            } else {
              results.details.push({
                action: 'skipped',
                repo: githubRepo.name,
                reason: matchingProject?.repository ? 'Project already has a repository' : 'No matching project found',
                status: 'info'
              });
            }
          }
        } catch (error: any) {
          results.errors++;
          results.details.push({
            action: 'error',
            repo: githubRepo.name,
            error: error.message,
            status: 'error'
          });
        }
      }

      // Clean up orphaned repositories (in DB but not in GitHub)
      const dbRepos = await prisma.repository.findMany({
        select: {
          id: true,
          githubName: true
        }
      });

      const githubRepoNames = new Set(githubRepos.map(r => r.name));
      const orphanedRepos = dbRepos.filter(r => r.githubName && !githubRepoNames.has(r.githubName));

      for (const orphaned of orphanedRepos) {
        await prisma.repository.delete({
          where: { id: orphaned.id }
        });
        results.details.push({
          action: 'deleted',
          repo: orphaned.githubName,
          reason: 'Not found in GitHub',
          status: 'warning'
        });
      }

      return NextResponse.json({
        success: true,
        message: `Sync completed. Synced: ${results.synced}, Created: ${results.created}, Errors: ${results.errors}`,
        results
      });
    } catch (error) {
      console.error('Error syncing with GitHub:', error);
      return NextResponse.json(
        { error: 'Failed to sync with GitHub', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),
  rateLimits.expensive
);