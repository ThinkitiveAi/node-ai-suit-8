console.log('✅ Node.js is working!');
console.log('📅 Current time:', new Date().toISOString());
console.log('📁 Working directory:', process.cwd());

// Test if Prisma client exists
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma Client is available');
} catch (error) {
  console.log('❌ Prisma Client not available:', error.message);
}

console.log('🎉 Simple test completed!'); 