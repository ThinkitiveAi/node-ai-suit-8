const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔄 Starting direct database migration...');
  
  // Read database URL from environment
  require('dotenv').config();
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('📍 Database URL found');
  
  // Create PostgreSQL client
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');
    
    // Read and execute migration SQL
    console.log('📖 Reading migration SQL...');
    const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20250731_restructure_ids', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⚠️  WARNING: This will completely restructure your database!');
    console.log('📊 Changes:');
    console.log('   • Converting UUID primary keys to auto-increment integers');
    console.log('   • Adding separate UUID columns');
    console.log('   • Updating foreign key references');
    console.log('');
    
    // Execute migration
    console.log('🔄 Executing migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!');
    
    // Test the new structure
    console.log('🧪 Testing new table structure...');
    
    // Check patients table structure
    const patientsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Patients table structure:');
    patientsResult.rows.forEach(row => {
      if (row.column_name === 'id' || row.column_name === 'uuid') {
        console.log(`   • ${row.column_name}: ${row.data_type} (${row.column_default || 'no default'})`);
      }
    });
    
    // Test inserting a record
    console.log('🔍 Testing record insertion...');
    const insertResult = await client.query(`
      INSERT INTO patients (first_name, last_name, email, phone_number, password_hash, date_of_birth, gender)
      VALUES ('Test', 'Migration', 'test.migration@example.com', '+1-555-9999', 'testhash', '1990-01-01', 'OTHER')
      RETURNING id, uuid, first_name, last_name;
    `);
    
    const testRecord = insertResult.rows[0];
    console.log('✅ Test record created:');
    console.log(`   • Integer ID: ${testRecord.id}`);
    console.log(`   • UUID: ${testRecord.uuid}`);
    console.log(`   • Name: ${testRecord.first_name} ${testRecord.last_name}`);
    
    // Clean up test record
    await client.query('DELETE FROM patients WHERE id = $1', [testRecord.id]);
    console.log('🧹 Test record cleaned up');
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart your NestJS application');
    console.log('   2. Run: npm run prisma:generate');
    console.log('   3. Run: npm run prisma:seed');
    console.log('   4. Test your API endpoints');
    console.log('');
    console.log('💡 Your database now has:');
    console.log('   • Integer primary keys (id) starting from 1');
    console.log('   • Separate UUID columns for distributed systems');
    console.log('   • Better performance with integer foreign keys');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
applyMigration().catch(console.error); 