#!/usr/bin/env node

/**
 * Script to fix database schema and start the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting application fix and startup process...');

// Step 1: Apply database migration
console.log('\n📊 Step 1: Applying database migration...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database (this will reset the database)
  console.log('Pushing schema to database...');
  execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });

  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  console.log('\n🔧 Manual steps required:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push --force-reset --accept-data-loss');
  console.log('3. Run: npm run prisma:seed');
}

// Step 2: Seed database
console.log('\n🌱 Step 2: Seeding database...');

try {
  execSync('npm run prisma:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  console.log('You may need to run: npm run prisma:seed manually');
}

// Step 3: Build application
console.log('\n🏗️ Step 3: Building application...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('There may be remaining TypeScript errors to fix.');
}

// Step 4: Start application
console.log('\n🚀 Step 4: Starting application...');

try {
  console.log('Starting NestJS application in development mode...');
  console.log('The application should be available at: http://localhost:3000');
  console.log('API documentation will be at: http://localhost:3000/api/docs');
  console.log('\nPress Ctrl+C to stop the application.');
  
  execSync('npm run start:dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start application:', error.message);
  console.log('\n🔧 Manual startup options:');
  console.log('1. Try: npm run start:dev');
  console.log('2. Or: npx nest start --watch');
  console.log('3. Or: npm run start:prod');
}

console.log('\n✅ Fix and startup process completed!'); 