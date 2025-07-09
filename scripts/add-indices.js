const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addIndices() {
  try {
    console.log('🔄 Adding performance indices...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../prisma/migrations/add_performance_indices.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by statements and filter out empty lines
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} index statements to execute`);
    
    // Execute each statement
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`⏳ Executing statement ${index + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ Statement ${index + 1} completed`);
      } catch (error) {
        // Some indices might already exist, which is fine
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${index + 1} - Index already exists (skipped)`);
        } else {
          console.error(`❌ Error in statement ${index + 1}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Index creation process completed!');
    
    // Verify some key indices exist
    console.log('🔍 Verifying key indices...');
    
    const verifyQueries = [
      "SELECT indexname FROM pg_indexes WHERE tablename = 'Project' AND indexname LIKE 'idx_projects%'",
      "SELECT indexname FROM pg_indexes WHERE tablename = 'User' AND indexname LIKE 'idx_users%'",
      "SELECT indexname FROM pg_indexes WHERE tablename = 'Activity' AND indexname LIKE 'idx_activities%'"
    ];
    
    for (const query of verifyQueries) {
      const result = await prisma.$queryRawUnsafe(query);
      console.log(`📊 Found ${result.length} indices:`, result.map(r => r.indexname));
    }
    
  } catch (error) {
    console.error('❌ Error adding indices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addIndices();