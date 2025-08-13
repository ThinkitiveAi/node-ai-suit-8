import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await prisma.refreshToken.deleteMany();
    await prisma.providerAvailability.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.patient.deleteMany();
  }

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('Demo123!@#', 12);

  // Create demo patients
  console.log('👥 Creating demo patients...');
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1-555-0101',
        passwordHash: hashedPassword,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'MALE',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      },
    }),
    prisma.patient.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+1-555-0102',
        passwordHash: hashedPassword,
        dateOfBirth: new Date('1985-08-22'),
        gender: 'FEMALE',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
      },
    }),
    prisma.patient.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@example.com',
        phoneNumber: '+1-555-0103',
        passwordHash: hashedPassword,
        dateOfBirth: new Date('1992-12-03'),
        gender: 'MALE',
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
      },
    }),
    prisma.patient.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@example.com',
        phoneNumber: '+1-555-0104',
        passwordHash: hashedPassword,
        dateOfBirth: new Date('1988-03-17'),
        gender: 'FEMALE',
        street: '321 Elm Dr',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
      },
    }),
  ]);

  console.log(`✅ Created ${patients.length} demo patients`);

  // Create demo providers
  console.log('🏥 Creating demo providers...');
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        firstName: 'Dr. Emily',
        lastName: 'Carter',
        email: 'dr.emily.carter@healthfirst.com',
        phoneNumber: '+1-555-0201',
        passwordHash: hashedPassword,
        specialization: 'Cardiology',
        licenseNumber: 'MD-12345-CA',
        yearsOfExperience: 15,
        clinicStreet: '100 Medical Center Dr',
        clinicCity: 'San Francisco',
        clinicState: 'CA',
        clinicZip: '94102',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Robert',
        lastName: 'Thompson',
        email: 'dr.robert.thompson@healthfirst.com',
        phoneNumber: '+1-555-0202',
        passwordHash: hashedPassword,
        specialization: 'Neurology',
        licenseNumber: 'MD-23456-NY',
        yearsOfExperience: 12,
        clinicStreet: '250 Hospital Ave',
        clinicCity: 'New York',
        clinicState: 'NY',
        clinicZip: '10016',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Maria',
        lastName: 'Rodriguez',
        email: 'dr.maria.rodriguez@healthfirst.com',
        phoneNumber: '+1-555-0203',
        passwordHash: hashedPassword,
        specialization: 'Pediatrics',
        licenseNumber: 'MD-34567-FL',
        yearsOfExperience: 8,
        clinicStreet: '75 Children\'s Way',
        clinicCity: 'Miami',
        clinicState: 'FL',
        clinicZip: '33101',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. David',
        lastName: 'Lee',
        email: 'dr.david.lee@healthfirst.com',
        phoneNumber: '+1-555-0204',
        passwordHash: hashedPassword,
        specialization: 'Orthopedics',
        licenseNumber: 'MD-45678-WA',
        yearsOfExperience: 20,
        clinicStreet: '500 Sports Medicine Blvd',
        clinicCity: 'Seattle',
        clinicState: 'WA',
        clinicZip: '98101',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Lisa',
        lastName: 'Anderson',
        email: 'dr.lisa.anderson@healthfirst.com',
        phoneNumber: '+1-555-0205',
        passwordHash: hashedPassword,
        specialization: 'Dermatology',
        licenseNumber: 'MD-56789-CO',
        yearsOfExperience: 10,
        clinicStreet: '88 Skin Care Center',
        clinicCity: 'Denver',
        clinicState: 'CO',
        clinicZip: '80202',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. James',
        lastName: 'Wilson',
        email: 'dr.james.wilson@healthfirst.com',
        phoneNumber: '+1-555-0206',
        passwordHash: hashedPassword,
        specialization: 'Internal Medicine',
        licenseNumber: 'MD-67890-GA',
        yearsOfExperience: 18,
        clinicStreet: '300 Primary Care Way',
        clinicCity: 'Atlanta',
        clinicState: 'GA',
        clinicZip: '30309',
      },
    }),
  ]);

  console.log(`✅ Created ${providers.length} demo providers`);

  // Create demo availability slots for providers
  console.log('📅 Creating demo availability slots...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const availabilitySlots: any[] = [];

  for (const provider of providers) {
    // Create availability for next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip weekends for some providers
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Morning slots (9 AM - 12 PM)
      const morningSlot = await prisma.providerAvailability.create({
        data: {
          providerId: provider.id,
          date: date,
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
          maxAppointments: 1,
          status: 'AVAILABLE',
          timezone: 'America/New_York',
        },
      });
      availabilitySlots.push(morningSlot);

      // Afternoon slots (2 PM - 5 PM)
      const afternoonSlot = await prisma.providerAvailability.create({
        data: {
          providerId: provider.id,
          date: date,
          startTime: '14:00',
          endTime: '17:00',
          slotDuration: 30,
          maxAppointments: 1,
          status: 'AVAILABLE',
          timezone: 'America/New_York',
        },
      });
      availabilitySlots.push(afternoonSlot);
    }
  }

  console.log(`✅ Created ${availabilitySlots.length} demo availability slots`);

  // Create some booked slots to show variety
  console.log('📋 Creating some booked appointments...');
  const sampleBookedSlots = availabilitySlots.slice(0, 10);
  
  for (const slot of sampleBookedSlots) {
    await prisma.providerAvailability.update({
      where: { id: slot.id },
      data: {
        status: 'BOOKED',
        currentAppointments: 1,
      },
    });
  }

  console.log('✅ Updated some slots to booked status');

  // Summary
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • ${patients.length} Patients created`);
  console.log(`   • ${providers.length} Providers created`);
  console.log(`   • ${availabilitySlots.length} Availability slots created`);
  console.log(`   • 10 Slots marked as booked`);
  
  console.log('\n🔐 Demo Login Credentials:');
  console.log('   Password for all accounts: Demo123!@#');
  console.log('\n   📧 Demo Patients:');
  patients.forEach(patient => {
    console.log(`      • ${patient.email} (${patient.firstName} ${patient.lastName})`);
  });
  
  console.log('\n   🏥 Demo Providers:');
  providers.forEach(provider => {
    console.log(`      • ${provider.email} (${provider.firstName} ${provider.lastName} - ${provider.specialization})`);
  });

  console.log('\n🚀 You can now start using the API with these demo accounts!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 