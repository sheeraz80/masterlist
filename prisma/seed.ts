import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  try {
    // Check if data already exists
    const existingProjects = await prisma.project.count();
    if (existingProjects > 0) {
      console.log(`Database already contains ${existingProjects} projects. Skipping seed.`);
      return;
    }

    // Load backup data
    const backupDir = path.join(__dirname, '../db/seed-data');
    
    // 1. Create default users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@masterlist.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          bio: 'System Administrator',
          preferences: JSON.stringify({
            notifications: true,
            theme: 'system',
            language: 'en'
          })
        }
      }),
      prisma.user.create({
        data: {
          email: 'user@masterlist.com',
          name: 'Demo User',
          password: hashedPassword,
          role: 'USER',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          bio: 'Demo User Account',
          preferences: JSON.stringify({
            notifications: true,
            theme: 'light',
            language: 'en'
          })
        }
      })
    ]);
    console.log(`Created ${users.length} users`);

    // 2. Load and create projects
    console.log('\nLoading projects from backup...');
    const projectsData = JSON.parse(
      await fs.readFile(path.join(backupDir, 'projects.json'), 'utf-8')
    );
    
    console.log(`Found ${projectsData.length} projects to import`);
    
    // Create projects in batches to avoid overwhelming the database
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < projectsData.length; i += batchSize) {
      const batch = projectsData.slice(i, i + batchSize);
      
      await prisma.project.createMany({
        data: batch.map((project: any) => ({
          id: project.id,
          title: project.title || 'Untitled Project',
          problem: project.problem || '',
          solution: project.solution || '',
          category: project.category || 'Uncategorized',
          targetUsers: project.target_users || project.targetUsers || '',
          revenueModel: project.revenue_model || project.revenueModel || '',
          revenuePotential: JSON.stringify(project.revenue_potential || project.revenuePotential || {}),
          developmentTime: project.development_time || project.developmentTime || '',
          competitionLevel: project.competition_level || project.competitionLevel || 'Medium',
          technicalComplexity: project.technical_complexity || project.technicalComplexity || 5,
          qualityScore: project.quality_score || project.qualityScore || 5,
          keyFeatures: JSON.stringify(project.key_features || project.keyFeatures || []),
          tags: JSON.stringify(project.tags || []),
          status: project.status || 'active',
          ownerId: project.ownerId || users[0].id
        }))
      });
      
      imported += batch.length;
      console.log(`Imported ${imported}/${projectsData.length} projects...`);
    }

    // 3. Create sample team
    console.log('\nCreating sample team...');
    const team = await prisma.team.create({
      data: {
        name: 'Development Team',
        description: 'Main development team for Masterlist projects',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=team1',
        settings: JSON.stringify({
          allowMemberInvite: true,
          requireApproval: false,
          visibility: 'public'
        }),
        createdById: users[0].id,
        members: {
          create: [
            {
              userId: users[0].id,
              role: 'OWNER',
              permissions: JSON.stringify(['all'])
            },
            {
              userId: users[1].id,
              role: 'MEMBER',
              permissions: JSON.stringify(['read', 'write'])
            }
          ]
        }
      }
    });
    console.log('Created team:', team.name);

    // 4. Load AI insights if available
    try {
      const insightsData = JSON.parse(
        await fs.readFile(path.join(backupDir, 'insights.json'), 'utf-8')
      );
      
      console.log(`\nImporting ${insightsData.length} AI insights...`);
      
      for (const insight of insightsData) {
        await prisma.aIInsight.create({
          data: {
            title: insight.title || 'Untitled Insight',
            description: insight.description || '',
            type: insight.type || 'recommendation',
            confidence: insight.confidence || 0.5,
            impact: insight.impact || 'medium',
            category: insight.category,
            projectIds: JSON.stringify(insight.project_ids || insight.projectIds || []),
            metadata: JSON.stringify(insight.metadata || {}),
            generatedAt: insight.generated_at ? new Date(insight.generated_at) : new Date(),
            expiresAt: insight.expires_at ? new Date(insight.expires_at) : null
          }
        });
      }
      console.log('AI insights imported successfully');
    } catch (error) {
      console.log('No AI insights found or error importing them');
    }

    // 5. Create sample activities
    console.log('\nCreating sample activities...');
    const sampleProjects = await prisma.project.findMany({ take: 3 });
    
    for (const project of sampleProjects) {
      await prisma.activity.create({
        data: {
          type: 'project_created',
          description: `Created project "${project.title}"`,
          metadata: JSON.stringify({ projectId: project.id }),
          userId: users[0].id,
          projectId: project.id
        }
      });
    }

    // Final summary
    const finalCounts = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.team.count(),
      prisma.aIInsight.count(),
      prisma.activity.count()
    ]);

    console.log('\n=== Seed Complete ===');
    console.log(`Projects: ${finalCounts[0]}`);
    console.log(`Users: ${finalCounts[1]}`);
    console.log(`Teams: ${finalCounts[2]}`);
    console.log(`AI Insights: ${finalCounts[3]}`);
    console.log(`Activities: ${finalCounts[4]}`);
    console.log('\nDatabase is ready!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });