#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch').default || require('node-fetch');

const prisma = new PrismaClient();

async function bulkEnhanceProjects() {
  console.log('🚀 Starting bulk project enhancement...\n');

  try {
    // Get all projects (we'll filter in memory to avoid Prisma issues)
    const projects = await prisma.project.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, title: true, qualityScore: true }
    });

    // Filter to projects that need enhancement
    const projectsToEnhance = projects.filter(p => !p.qualityScore || p.qualityScore < 7);

    console.log(`Found ${projectsToEnhance.length} projects to enhance out of ${projects.length} total\n`);

    let enhancedCount = 0;
    let skippedCount = 0;

    for (const project of projectsToEnhance) {
      try {
        console.log(`Enhancing: ${project.title} (ID: ${project.id})`);
        
        // Call the enhancement API
        const response = await fetch(`http://localhost:3000/api/projects/${project.id}/enhance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          enhancedCount++;
          
          console.log(`✅ Enhanced: ${project.title}`);
          console.log(`   Quality: ${result.enhancements.before.quality_score} → ${result.enhancements.after.quality_score}`);
          console.log(`   Revenue: $${result.enhancements.before.revenue_potential?.realistic || 0} → $${result.enhancements.after.revenue_potential?.realistic || 0}\n`);
        } else {
          console.log(`❌ Failed to enhance: ${project.title} - ${response.status}\n`);
          skippedCount++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error enhancing ${project.title}:`, error.message);
        skippedCount++;
      }
    }

    // Get final stats
    const finalStats = await prisma.project.aggregate({
      _avg: { qualityScore: true },
      _count: { id: true }
    });

    console.log('\n📊 Enhancement Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`Projects Enhanced: ${enhancedCount}`);
    console.log(`Projects Skipped: ${skippedCount}`);
    console.log(`Average Quality Score: ${finalStats._avg.qualityScore?.toFixed(1) || 'N/A'}`);
    console.log(`Total Projects: ${finalStats._count.id}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

bulkEnhanceProjects().catch(console.error);