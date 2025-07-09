const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function exportDatabaseBackup() {
  console.log('Exporting database backup...\n');

  try {
    const seedDir = path.join(__dirname, '../db/seed-data');
    
    // Ensure directory exists
    await fs.mkdir(seedDir, { recursive: true });

    // 1. Export projects
    console.log('Exporting projects...');
    const projects = await prisma.project.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Transform to match original format
    const projectsData = projects.map(p => ({
      id: p.id,
      title: p.title,
      problem: p.problem,
      solution: p.solution,
      category: p.category,
      target_users: p.targetUsers,
      revenue_model: p.revenueModel,
      revenue_potential: JSON.parse(p.revenuePotential || '{}'),
      development_time: p.developmentTime,
      competition_level: p.competitionLevel,
      technical_complexity: p.technicalComplexity,
      quality_score: p.qualityScore,
      key_features: JSON.parse(p.keyFeatures || '[]'),
      tags: JSON.parse(p.tags || '[]'),
      status: p.status,
      ownerId: p.ownerId
    }));
    
    await fs.writeFile(
      path.join(seedDir, 'projects.json'),
      JSON.stringify(projectsData, null, 2)
    );
    console.log(`Exported ${projects.length} projects`);

    // 2. Export AI insights
    console.log('Exporting AI insights...');
    const insights = await prisma.aIInsight.findMany({
      orderBy: { id: 'asc' }
    });
    
    const insightsData = insights.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      type: i.type,
      confidence: i.confidence,
      impact: i.impact,
      category: i.category,
      project_ids: JSON.parse(i.projectIds || '[]'),
      metadata: JSON.parse(i.metadata || '{}'),
      generated_at: i.generatedAt.toISOString(),
      expires_at: i.expiresAt?.toISOString() || null
    }));
    
    await fs.writeFile(
      path.join(seedDir, 'insights.json'),
      JSON.stringify(insightsData, null, 2)
    );
    console.log(`Exported ${insights.length} AI insights`);

    // 3. Create backup metadata
    let schemaVersion = 'unknown';
    try {
      const result = await prisma.$queryRaw`SELECT "revision" FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 1`;
      schemaVersion = result[0]?.revision || 'unknown';
    } catch (e) {
      // Migrations table might not exist
      schemaVersion = 'no-migrations-table';
    }
    
    const metadata = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      counts: {
        projects: projects.length,
        insights: insights.length,
        users: await prisma.user.count(),
        teams: await prisma.team.count(),
        activities: await prisma.activity.count()
      },
      schema_version: schemaVersion
    };
    
    await fs.writeFile(
      path.join(seedDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n=== Backup Complete ===');
    console.log(`Location: ${seedDir}`);
    console.log(`Projects: ${metadata.counts.projects}`);
    console.log(`AI Insights: ${metadata.counts.insights}`);
    console.log(`Export time: ${metadata.exported_at}`);

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  exportDatabaseBackup();
}

module.exports = { exportDatabaseBackup };