// Script to normalize existing categories in the database
// This maps variations to standardized category names

import { PrismaClient } from '@prisma/client';
import { normalizeCategoryName } from '../src/lib/constants/categories';

const prisma = new PrismaClient();

// Mapping of old category names to new standardized ones
const CATEGORY_MAPPINGS: Record<string, string> = {
  // Chrome variations
  'Chrome Browser Extensions': 'Chrome Extension',
  'Browser Extension': 'Chrome Extension',
  
  // VSCode variations
  'VSCode Extensions': 'VSCode Extension',
  'VSCode Extensions (Developer productivity tools)': 'VSCode Extension',
  'VS Code Extension': 'VSCode Extension',
  
  // AI variations
  'AI-Powered Browser Tools': 'AI Browser Tools',
  'AI-Powered Productivity Automation Tools (Zero-Server, Platform-Hosted)': 'AI Productivity Tools',
  'AI Productivity Automation Platforms (e.g., Zapier, IFTTT, Power Automate, Make)': 'AI Automation Platforms',
  
  // Crypto variations
  'Crypto/Blockchain Browser Tools': 'Crypto Browser Tools',
  'Blockchain Browser Tools': 'Crypto Browser Tools',
  
  // Notion variations
  'Notion Templates & Widgets': 'Notion Templates',
  'Notion Widgets': 'Notion Templates',
  
  // Zapier variations
  'Zapier AI Automation Apps (Zero-Server, Platform-Hosted)': 'Zapier Apps',
  'Zapier AI Automation Apps': 'Zapier Apps',
  'Zapier Automation': 'Zapier Apps',
  
  // Other platforms
  'Jasper Canvas & AI Studio': 'AI Writing Tools',
};

async function normalizeCategories() {
  console.log('Starting category normalization...');
  
  try {
    // Get all unique categories
    const projects = await prisma.project.findMany({
      select: { id: true, category: true },
      distinct: ['category']
    });
    
    console.log(`Found ${projects.length} unique categories`);
    
    let updateCount = 0;
    
    for (const project of projects) {
      const oldCategory = project.category;
      
      // Check if we have a direct mapping
      let newCategory = CATEGORY_MAPPINGS[oldCategory];
      
      // If not, try to normalize using the category system
      if (!newCategory) {
        newCategory = normalizeCategoryName(oldCategory);
      }
      
      // Only update if the category changed
      if (newCategory !== oldCategory) {
        console.log(`Updating: "${oldCategory}" -> "${newCategory}"`);
        
        await prisma.project.updateMany({
          where: { category: oldCategory },
          data: { category: newCategory }
        });
        
        updateCount++;
      }
    }
    
    console.log(`\nNormalization complete!`);
    console.log(`Updated ${updateCount} categories`);
    
    // Show final category distribution
    const finalCategories = await prisma.project.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } }
    });
    
    console.log('\nFinal category distribution:');
    finalCategories.forEach(({ category, _count }) => {
      console.log(`  ${category}: ${_count.category} projects`);
    });
    
  } catch (error) {
    console.error('Error normalizing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
normalizeCategories();