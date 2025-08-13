const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function applySchemaChanges() {
  try {
    console.log('🔄 Applying major schema changes...');
    console.log('⚠️  WARNING: This will completely restructure the database with integer primary keys!');
    console.log('📊 Changes:');
    console.log('   • id columns: UUID → Auto-increment Integer (Primary Key)');
    console.log('   • uuid columns: New separate UUID field');
    console.log('   • Foreign keys: Updated to use integer references');
    console.log('');
    
    // Generate Prisma client with new schema
    console.log('📦 Generating Prisma client with new schema...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Reset database and apply new schema
    console.log('🗄️  Resetting database and applying new schema...');
    console.log('   This will drop all existing data and recreate tables...');
    execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Schema restructuring completed successfully!');
    console.log('');
    console.log('📊 New table structure:');
    console.log('   ┌─────────────────────────────────────────────┐');
    console.log('   │ Table Name                │ ID Type │ UUID  │');
    console.log('   ├─────────────────────────────────────────────┤');
    console.log('   │ patients                  │ INTEGER │ UUID  │');
    console.log('   │ providers                 │ INTEGER │ UUID  │');
    console.log('   │ refresh_tokens            │ INTEGER │ UUID  │');
    console.log('   │ provider_availability     │ INTEGER │ UUID  │');
    console.log('   │ provider_availability_settings │ INTEGER │ UUID  │');
    console.log('   │ provider_block_days       │ INTEGER │ UUID  │');
    console.log('   └─────────────────────────────────────────────┘');
    console.log('');
    
    console.log('🔍 Testing database connection with new schema...');
    
    const prisma = new PrismaClient();
    
    // Test the new schema by creating sample records
    console.log('🧪 Testing new integer ID and UUID system...');
    
    // Create a test patient to verify the new structure
    const testPatient = await prisma.patient.create({
      data: {
        firstName: 'Test',
        lastName: 'IntegerID',
        email: `test.integer.${Date.now()}@example.com`,
        phoneNumber: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        passwordHash: 'test',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER'
      }
    });
    
    console.log(`✅ Patient creation test successful!`);
    console.log(`   • Integer ID: ${testPatient.id}`);
    console.log(`   • UUID: ${testPatient.uuid}`);
    console.log(`   • Name: ${testPatient.firstName} ${testPatient.lastName}`);
    
    // Create a test provider
    const testProvider = await prisma.provider.create({
      data: {
        firstName: 'Dr. Test',
        lastName: 'IntegerID',
        email: `test.provider.integer.${Date.now()}@example.com`,
        phoneNumber: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        passwordHash: 'test',
        specialization: 'Test Medicine',
        licenseNumber: `MD-${Date.now()}`
      }
    });
    
    console.log(`✅ Provider creation test successful!`);
    console.log(`   • Integer ID: ${testProvider.id}`);
    console.log(`   • UUID: ${testProvider.uuid}`);
    console.log(`   • Name: ${testProvider.firstName} ${testProvider.lastName}`);
    
    // Test foreign key relationship
    const testAvailability = await prisma.providerAvailability.create({
      data: {
        providerId: testProvider.id, // Using integer ID for foreign key
        date: new Date('2024-08-01'),
        startTime: '09:00',
        endTime: '17:00'
      }
    });
    
    console.log(`✅ Availability creation test successful!`);
    console.log(`   • Integer ID: ${testAvailability.id}`);
    console.log(`   • UUID: ${testAvailability.uuid}`);
    console.log(`   • Provider ID (FK): ${testAvailability.providerId}`);
    
    // Test querying by both ID types
    const patientById = await prisma.patient.findUnique({
      where: { id: testPatient.id }
    });
    
    const patientByUuid = await prisma.patient.findUnique({
      where: { uuid: testPatient.uuid }
    });
    
    console.log(`✅ Query tests successful!`);
    console.log(`   • Query by integer ID: ${patientById ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   • Query by UUID: ${patientByUuid ? 'SUCCESS' : 'FAILED'}`);
    
    // Clean up test records
    await prisma.providerAvailability.delete({ where: { id: testAvailability.id } });
    await prisma.provider.delete({ where: { id: testProvider.id } });
    await prisma.patient.delete({ where: { id: testPatient.id } });
    console.log('🧹 Test records cleaned up.');
    
    console.log('');
    console.log('🎉 Database restructuring completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run prisma:seed (to populate with demo data)');
    console.log('   2. Update your application code to use integer IDs where needed');
    console.log('   3. Test your API endpoints');
    console.log('');
    console.log('💡 Benefits of the new structure:');
    console.log('   • Faster queries with integer primary keys');
    console.log('   • Human-readable sequential IDs (1, 2, 3...)');
    console.log('   • UUIDs still available for distributed systems');
    console.log('   • Better database performance');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error applying schema changes:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout.toString());
    if (error.stderr) console.log('STDERR:', error.stderr.toString());
    process.exit(1);
  }
}

applySchemaChanges(); 