const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@masterlist.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AU'
      }
    });
    console.log('✅ Admin user created');

    // Create demo users
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demoUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john@example.com',
          password: demoPassword,
          name: 'John Doe',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JD'
        }
      }),
      prisma.user.create({
        data: {
          email: 'jane@example.com',
          password: demoPassword,
          name: 'Jane Smith',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS'
        }
      }),
      prisma.user.create({
        data: {
          email: 'alice@example.com',
          password: demoPassword,
          name: 'Alice Johnson',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ'
        }
      })
    ]);
    console.log('✅ Demo users created');

    // Load projects from JSON
    const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
    const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
    
    // Insert projects
    for (const project of projectsData) {
      await prisma.project.create({
        data: {
          id: project.id,
          title: project.title,
          problem: project.problem,
          solution: project.solution,
          category: project.category,
          targetUsers: project.target_users,
          revenueModel: project.revenue_model,
          revenuePotential: JSON.stringify(project.revenue_potential),
          developmentTime: project.development_time,
          competitionLevel: project.competition_level,
          technicalComplexity: project.technical_complexity,
          qualityScore: project.quality_score,
          keyFeatures: JSON.stringify(project.key_features),
          tags: JSON.stringify(project.tags || []),
          ownerId: Math.random() > 0.7 ? adminUser.id : null // Randomly assign some projects to admin
        }
      });
    }
    console.log(`✅ ${projectsData.length} projects imported`);

    // Create teams
    const teams = await Promise.all([
      prisma.team.create({
        data: {
          name: 'AI Innovation Lab',
          description: 'Focused on cutting-edge AI projects and research',
          members: {
            create: [
              { userId: adminUser.id, role: 'owner' },
              { userId: demoUsers[0].id, role: 'admin' },
              { userId: demoUsers[1].id, role: 'member' }
            ]
          }
        }
      }),
      prisma.team.create({
        data: {
          name: 'Product Development',
          description: 'Building next-generation products',
          members: {
            create: [
              { userId: demoUsers[1].id, role: 'owner' },
              { userId: demoUsers[2].id, role: 'member' }
            ]
          }
        }
      })
    ]);
    console.log('✅ Teams created');

    // Assign some projects to teams
    const aiProjects = await prisma.project.findMany({
      where: { tags: { contains: 'AI' } },
      take: 10
    });

    for (const project of aiProjects) {
      await prisma.teamProject.create({
        data: {
          teamId: teams[0].id,
          projectId: project.id,
          status: ['assigned', 'in_progress', 'completed'][Math.floor(Math.random() * 3)]
        }
      });
    }
    console.log('✅ Projects assigned to teams');

    // Create sample comments
    const sampleProjects = await prisma.project.findMany({ take: 20 });
    for (const project of sampleProjects) {
      const commentCount = Math.floor(Math.random() * 5);
      for (let i = 0; i < commentCount; i++) {
        const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        await prisma.comment.create({
          data: {
            projectId: project.id,
            userId: user.id,
            content: [
              'Great project idea! The market potential looks promising.',
              'Have you considered the technical challenges with scaling?',
              'I love the AI integration aspect. This could be huge!',
              'The revenue model seems solid. What about customer acquisition?',
              'Excellent analysis of the competition.',
              'This aligns perfectly with current market trends.',
              'The quality score seems accurate based on the features.',
              'Would love to collaborate on this project!'
            ][Math.floor(Math.random() * 8)],
            type: Math.random() > 0.7 ? 'review' : 'comment',
            rating: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : null
          }
        });
      }
    }
    console.log('✅ Sample comments created');

    // Create activities
    const activities = [
      { type: 'project_created', description: 'New project added to the portfolio' },
      { type: 'comment_added', description: 'Added a comment on project' },
      { type: 'status_changed', description: 'Project status updated' },
      { type: 'member_joined', description: 'New member joined the team' },
      { type: 'project_assigned', description: 'Project assigned to team' }
    ];

    for (let i = 0; i < 50; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const user = [...demoUsers, adminUser][Math.floor(Math.random() * 4)];
      const project = sampleProjects[Math.floor(Math.random() * sampleProjects.length)];
      
      await prisma.activity.create({
        data: {
          type: activity.type,
          description: `${user.name} ${activity.description}`,
          userId: user.id,
          projectId: Math.random() > 0.3 ? project.id : null,
          teamId: Math.random() > 0.7 ? teams[Math.floor(Math.random() * teams.length)].id : null,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        }
      });
    }
    console.log('✅ Activities created');

    // Create system metrics
    const metrics = ['cpu_usage', 'memory_usage', 'response_time', 'active_users', 'api_calls'];
    const services = ['api', 'database', 'ai_service', 'cache', 'search'];
    
    for (let i = 0; i < 100; i++) {
      const metric = metrics[Math.floor(Math.random() * metrics.length)];
      let value, unit;
      
      switch (metric) {
        case 'cpu_usage':
        case 'memory_usage':
          value = Math.random() * 100;
          unit = 'percentage';
          break;
        case 'response_time':
          value = Math.random() * 200 + 10;
          unit = 'ms';
          break;
        case 'active_users':
          value = Math.floor(Math.random() * 1000);
          unit = 'count';
          break;
        case 'api_calls':
          value = Math.floor(Math.random() * 10000);
          unit = 'count';
          break;
      }
      
      await prisma.systemMetric.create({
        data: {
          metric,
          value,
          unit,
          service: services[Math.floor(Math.random() * services.length)],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours
        }
      });
    }
    console.log('✅ System metrics created');

    // Create AI insights
    const insightTypes = ['opportunity', 'risk', 'trend', 'recommendation'];
    const impacts = ['low', 'medium', 'high'];
    
    for (let i = 0; i < 20; i++) {
      const relatedProjects = sampleProjects
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 1)
        .map(p => p.id);
      
      await prisma.aIInsight.create({
        data: {
          title: [
            'High-Growth AI Market Opportunity',
            'Emerging Blockchain Integration Trend',
            'Competition Risk in Browser Extension Space',
            'Recommendation: Focus on B2B SaaS',
            'Mobile-First Development Priority',
            'Security Enhancement Opportunity',
            'Market Saturation Risk',
            'Cross-Platform Integration Trend'
          ][Math.floor(Math.random() * 8)],
          description: 'AI-generated insight based on market analysis and project portfolio evaluation.',
          type: insightTypes[Math.floor(Math.random() * insightTypes.length)],
          confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
          impact: impacts[Math.floor(Math.random() * impacts.length)],
          projectIds: JSON.stringify(relatedProjects),
          metadata: JSON.stringify({
            model: 'gpt-4',
            version: '1.0',
            analysis_date: new Date().toISOString()
          })
        }
      });
    }
    console.log('✅ AI insights created');

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin: admin@masterlist.com / admin123');
    console.log('   Users: john@example.com, jane@example.com, alice@example.com / demo123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization
initDatabase();