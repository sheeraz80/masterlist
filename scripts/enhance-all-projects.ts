#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { 
  enhanceProjectDescription, 
  calculateQualityScore,
  generateImplementationPrompt 
} from '../src/lib/project-enhancement/enhance-projects.js';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function enhanceAllProjects() {
  console.log('🚀 Starting project enhancement process...\n');

  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      orderBy: { qualityScore: 'asc' }, // Start with lowest quality
      take: 650 // Process all projects
    });

    console.log(`Found ${projects.length} projects to enhance\n`);

    let enhancedCount = 0;
    let totalQualityImprovement = 0;
    let totalRevenueImprovement = 0;

    // Create a report
    const report = {
      timestamp: new Date().toISOString(),
      projectsProcessed: 0,
      averageQualityBefore: 0,
      averageQualityAfter: 0,
      totalRevenueBefore: 0,
      totalRevenueAfter: 0,
      enhancements: []
    };

    // Calculate initial metrics
    const initialAvgQuality = projects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / projects.length;
    const initialTotalRevenue = projects.reduce((sum, p) => {
      const revenue = typeof p.revenuePotential === 'string' 
        ? JSON.parse(p.revenuePotential) 
        : p.revenuePotential;
      return sum + (revenue?.realistic || 0);
    }, 0);

    report.averageQualityBefore = Math.round(initialAvgQuality * 10) / 10;
    report.totalRevenueBefore = initialTotalRevenue;

    console.log(`Initial Average Quality: ${report.averageQualityBefore}/10`);
    console.log(`Initial Total Revenue Potential: $${report.totalRevenueBefore.toLocaleString()}/mo\n`);

    // Process each project
    for (const dbProject of projects) {
      try {
        // Convert database project to our format
        const project = {
          id: dbProject.id,
          title: dbProject.title,
          problem: dbProject.problem,
          solution: dbProject.solution,
          category: dbProject.category,
          target_users: dbProject.targetUsers || '',
          revenue_model: dbProject.revenueModel || '',
          revenue_potential: typeof dbProject.revenuePotential === 'string' 
            ? JSON.parse(dbProject.revenuePotential) 
            : dbProject.revenuePotential,
          development_time: dbProject.developmentTime || '',
          competition_level: dbProject.competitionLevel || '',
          technical_complexity: dbProject.technicalComplexity || 5,
          quality_score: dbProject.qualityScore || 0,
          key_features: typeof dbProject.keyFeatures === 'string'
            ? JSON.parse(dbProject.keyFeatures)
            : dbProject.keyFeatures || [],
          tags: typeof dbProject.tags === 'string'
            ? JSON.parse(dbProject.tags)
            : dbProject.tags || []
        };

        // Enhance the project
        const enhancements = enhanceProjectDescription(project);
        
        if (Object.keys(enhancements).length > 0) {
          // Update the project in database
          const updateData: any = {};
          
          if (enhancements.problem) updateData.problem = enhancements.problem;
          if (enhancements.solution) updateData.solution = enhancements.solution;
          if (enhancements.revenue_model) updateData.revenueModel = enhancements.revenue_model;
          if (enhancements.target_users) updateData.targetUsers = enhancements.target_users;
          if (enhancements.quality_score !== undefined) updateData.qualityScore = enhancements.quality_score;
          if (enhancements.revenue_potential) updateData.revenuePotential = JSON.stringify(enhancements.revenue_potential);
          if (enhancements.key_features) updateData.keyFeatures = JSON.stringify(enhancements.key_features);
          if (enhancements.tags) updateData.tags = JSON.stringify(enhancements.tags);
          
          // Always update the timestamp
          updateData.updatedAt = new Date();
          
          await prisma.project.update({
            where: { id: dbProject.id },
            data: updateData
          });

          // Track improvements
          const qualityImprovement = (enhancements.quality_score || project.quality_score) - project.quality_score;
          const revenueImprovement = (enhancements.revenue_potential?.realistic || 0) - (project.revenue_potential?.realistic || 0);
          
          totalQualityImprovement += qualityImprovement;
          totalRevenueImprovement += revenueImprovement;
          enhancedCount++;

          // Add to report
          report.enhancements.push({
            id: project.id,
            title: project.title,
            category: project.category,
            qualityBefore: project.quality_score,
            qualityAfter: enhancements.quality_score || project.quality_score,
            revenueBefore: project.revenue_potential?.realistic || 0,
            revenueAfter: enhancements.revenue_potential?.realistic || 0
          });

          console.log(`✅ Enhanced: ${project.title}`);
          console.log(`   Quality: ${project.quality_score} → ${enhancements.quality_score} (+${qualityImprovement.toFixed(1)})`);
          console.log(`   Revenue: $${project.revenue_potential?.realistic || 0} → $${enhancements.revenue_potential?.realistic || 0} (+$${revenueImprovement})\n`);
        }
      } catch (error) {
        console.error(`❌ Error enhancing project ${dbProject.id}:`, error.message);
      }
    }

    // Calculate final metrics
    const enhancedProjects = await prisma.project.findMany();
    const finalAvgQuality = enhancedProjects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / enhancedProjects.length;
    const finalTotalRevenue = enhancedProjects.reduce((sum, p) => {
      const revenue = typeof p.revenuePotential === 'string' 
        ? JSON.parse(p.revenuePotential) 
        : p.revenuePotential;
      return sum + (revenue?.realistic || 0);
    }, 0);

    report.projectsProcessed = enhancedCount;
    report.averageQualityAfter = Math.round(finalAvgQuality * 10) / 10;
    report.totalRevenueAfter = finalTotalRevenue;

    // Save report
    const reportPath = path.join(process.cwd(), 'reports', `enhancement-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n📊 Enhancement Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Projects Enhanced: ${enhancedCount}/${projects.length}`);
    console.log(`Average Quality: ${report.averageQualityBefore} → ${report.averageQualityAfter} (+${(report.averageQualityAfter - report.averageQualityBefore).toFixed(1)})`);
    console.log(`Total Revenue Potential: $${report.totalRevenueBefore.toLocaleString()} → $${report.totalRevenueAfter.toLocaleString()} (+$${(report.totalRevenueAfter - report.totalRevenueBefore).toLocaleString()})`);
    console.log(`\nReport saved to: ${reportPath}`);

    // Generate sample implementation prompts for top 5 projects
    console.log('\n📝 Generating sample implementation prompts...');
    const topProjects = await prisma.project.findMany({
      orderBy: { qualityScore: 'desc' },
      take: 5
    });

    const promptsDir = path.join(process.cwd(), 'prompts');
    await fs.mkdir(promptsDir, { recursive: true });

    for (const dbProject of topProjects) {
      const project = {
        id: dbProject.id,
        title: dbProject.title,
        problem: dbProject.problem,
        solution: dbProject.solution,
        category: dbProject.category,
        target_users: dbProject.targetUsers || '',
        revenue_model: dbProject.revenueModel || '',
        revenue_potential: typeof dbProject.revenuePotential === 'string' 
          ? JSON.parse(dbProject.revenuePotential) 
          : dbProject.revenuePotential,
        development_time: dbProject.developmentTime || '',
        competition_level: dbProject.competitionLevel || '',
        technical_complexity: dbProject.technicalComplexity || 5,
        quality_score: dbProject.qualityScore || 0,
        key_features: typeof dbProject.keyFeatures === 'string'
          ? JSON.parse(dbProject.keyFeatures)
          : dbProject.keyFeatures || [],
        tags: typeof dbProject.tags === 'string'
          ? JSON.parse(dbProject.tags)
          : dbProject.tags || []
      };

      const prompt = generateImplementationPrompt(project);
      const promptPath = path.join(promptsDir, `${dbProject.id}-${dbProject.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`);
      await fs.writeFile(promptPath, prompt);
      console.log(`✅ Generated prompt for: ${dbProject.title}`);
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhancement
enhanceAllProjects().catch(console.error);