const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Get the first user or create one if none exists
    let user = await prisma.user.findFirst();
    
    if (!user) {
      // Create an admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@masterlist.com',
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log('Created admin user:');
      console.log('Email: admin@masterlist.com');
      console.log('Password: admin123');
    } else {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      });
      
      console.log(`Updated user ${user.email} to admin role`);
    }
    
    console.log('Admin user ready:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();