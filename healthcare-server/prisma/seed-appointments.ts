import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.provider.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567890',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        dateOfBirth: new Date('1990-05-15'),
        gender: 'MALE',
        street: '123 Main Street',
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
        phoneNumber: '+1234567891',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        dateOfBirth: new Date('1985-08-22'),
        gender: 'FEMALE',
        street: '456 Oak Avenue',
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
        phoneNumber: '+1234567892',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        dateOfBirth: new Date('1978-12-03'),
        gender: 'MALE',
        street: '789 Pine Road',
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
        phoneNumber: '+1234567893',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        dateOfBirth: new Date('1992-03-10'),
        gender: 'FEMALE',
        street: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
      },
    }),
    prisma.patient.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        phoneNumber: '+1234567894',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        dateOfBirth: new Date('1980-07-18'),
        gender: 'MALE',
        street: '654 Maple Drive',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85001',
      },
    }),
  ]);

  console.log('👥 Created patients:', patients.length);

  // Create providers
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        firstName: 'Dr. Emily',
        lastName: 'Carter',
        email: 'dr.emily.carter@healthfirst.com',
        phoneNumber: '+1987654321',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        specialization: 'Cardiology',
        licenseNumber: 'MD123456',
        yearsOfExperience: 15,
        clinicStreet: '100 Medical Center Dr',
        clinicCity: 'New York',
        clinicState: 'NY',
        clinicZip: '10002',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Robert',
        lastName: 'Thompson',
        email: 'dr.robert.thompson@healthfirst.com',
        phoneNumber: '+1987654322',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        specialization: 'Neurology',
        licenseNumber: 'MD123457',
        yearsOfExperience: 20,
        clinicStreet: '200 Neurology Ave',
        clinicCity: 'Los Angeles',
        clinicState: 'CA',
        clinicZip: '90211',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Maria',
        lastName: 'Rodriguez',
        email: 'dr.maria.rodriguez@healthfirst.com',
        phoneNumber: '+1987654323',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        specialization: 'Pediatrics',
        licenseNumber: 'MD123458',
        yearsOfExperience: 12,
        clinicStreet: '300 Pediatric Blvd',
        clinicCity: 'Chicago',
        clinicState: 'IL',
        clinicZip: '60602',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. James',
        lastName: 'Wilson',
        email: 'dr.james.wilson@healthfirst.com',
        phoneNumber: '+1987654324',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        specialization: 'Orthopedics',
        licenseNumber: 'MD123459',
        yearsOfExperience: 18,
        clinicStreet: '400 Orthopedic Way',
        clinicCity: 'Houston',
        clinicState: 'TX',
        clinicZip: '77002',
      },
    }),
    prisma.provider.create({
      data: {
        firstName: 'Dr. Lisa',
        lastName: 'Anderson',
        email: 'dr.lisa.anderson@healthfirst.com',
        phoneNumber: '+1987654325',
        passwordHash: await bcrypt.hash('Demo123!@#', 12),
        specialization: 'Dermatology',
        licenseNumber: 'MD123460',
        yearsOfExperience: 10,
        clinicStreet: '500 Dermatology St',
        clinicCity: 'Phoenix',
        clinicState: 'AZ',
        clinicZip: '85002',
      },
    }),
  ]);

  console.log('👨‍⚕️ Created providers:', providers.length);

  // Create appointments
  const appointments = await Promise.all([
    // In-Person Appointments
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        providerId: providers[0].id,
        appointmentType: 'General Checkup',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date('2025-01-15T10:00:00Z'),
        estimatedAmount: 150.00,
        reasonForVisit: 'Annual physical examination and blood work',
        status: 'CONFIRMED',
        notes: 'Patient requested comprehensive blood panel',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        providerId: providers[1].id,
        appointmentType: 'Neurological Consultation',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date('2025-01-16T14:30:00Z'),
        estimatedAmount: 250.00,
        reasonForVisit: 'Headache and dizziness evaluation',
        status: 'SCHEDULED',
        notes: 'Patient experiencing frequent migraines',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        providerId: providers[2].id,
        appointmentType: 'Pediatric Checkup',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date('2025-01-17T09:00:00Z'),
        estimatedAmount: 120.00,
        reasonForVisit: 'Regular pediatric examination',
        status: 'SCHEDULED',
        notes: 'Routine vaccination due',
      },
    }),

    // Video Call Appointments
    prisma.appointment.create({
      data: {
        patientId: patients[3].id,
        providerId: providers[0].id,
        appointmentType: 'Cardiology Follow-up',
        appointmentMode: 'VIDEO_CALL',
        scheduledDate: new Date('2025-01-18T11:00:00Z'),
        estimatedAmount: 180.00,
        reasonForVisit: 'Follow-up consultation for heart condition',
        status: 'CONFIRMED',
        notes: 'Remote consultation for medication review',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[4].id,
        providerId: providers[3].id,
        appointmentType: 'Orthopedic Consultation',
        appointmentMode: 'VIDEO_CALL',
        scheduledDate: new Date('2025-01-19T15:00:00Z'),
        estimatedAmount: 200.00,
        reasonForVisit: 'Knee pain evaluation',
        status: 'SCHEDULED',
        notes: 'Patient reports knee instability',
      },
    }),

    // Home Visit Appointments
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        providerId: providers[4].id,
        appointmentType: 'Dermatology Home Visit',
        appointmentMode: 'HOME',
        scheduledDate: new Date('2025-01-20T10:00:00Z'),
        estimatedAmount: 300.00,
        reasonForVisit: 'Skin condition evaluation for elderly patient',
        status: 'SCHEDULED',
        notes: 'Patient has mobility issues, requires home visit',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        providerId: providers[0].id,
        appointmentType: 'Cardiology Home Visit',
        appointmentMode: 'HOME',
        scheduledDate: new Date('2025-01-21T13:00:00Z'),
        estimatedAmount: 350.00,
        reasonForVisit: 'Home-based cardiac assessment',
        status: 'CONFIRMED',
        notes: 'Patient recovering from heart surgery',
      },
    }),

    // Future Appointments
    prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        providerId: providers[1].id,
        appointmentType: 'Neurology Follow-up',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date('2025-02-01T16:00:00Z'),
        estimatedAmount: 220.00,
        reasonForVisit: 'Follow-up on treatment progress',
        status: 'SCHEDULED',
        notes: 'Review of medication effectiveness',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[3].id,
        providerId: providers[2].id,
        appointmentType: 'Pediatric Vaccination',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date('2025-02-05T10:30:00Z'),
        estimatedAmount: 100.00,
        reasonForVisit: 'Annual vaccination appointment',
        status: 'SCHEDULED',
        notes: 'Flu shot and routine vaccinations',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[4].id,
        providerId: providers[3].id,
        appointmentType: 'Orthopedic Surgery Consultation',
        appointmentMode: 'VIDEO_CALL',
        scheduledDate: new Date('2025-02-10T14:00:00Z'),
        estimatedAmount: 280.00,
        reasonForVisit: 'Pre-surgery consultation',
        status: 'SCHEDULED',
        notes: 'Discuss surgical options for knee replacement',
      },
    }),
  ]);

  console.log('📅 Created appointments:', appointments.length);

  // Create provider availability settings
  await Promise.all(
    providers.map(provider =>
      prisma.providerAvailabilitySettings.create({
        data: {
          providerId: provider.id,
          bookingWindowDays: 30,
          bookingWindowType: 'DAYS',
          timezone: 'UTC',
          newAppointmentDuration: 30,
          followUpAppointmentDuration: 15,
          minimumNoticeAmount: 2,
          minimumNoticeType: 'HOURS',
          eventBufferMinutes: 15,
        },
      })
    )
  );

  console.log('⚙️ Created provider availability settings');

  // Create some sample availability slots
  const availabilitySlots = await Promise.all([
    prisma.providerAvailability.create({
      data: {
        providerId: providers[0].id,
        date: new Date('2025-01-22'),
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false,
        slotDuration: 30,
        status: 'AVAILABLE',
        maxAppointments: 16,
        currentAppointments: 0,
        timezone: 'UTC',
        location: 'Cardiology Clinic',
        isVirtual: false,
      },
    }),
    prisma.providerAvailability.create({
      data: {
        providerId: providers[1].id,
        date: new Date('2025-01-23'),
        startTime: '10:00',
        endTime: '16:00',
        isRecurring: false,
        slotDuration: 45,
        status: 'AVAILABLE',
        maxAppointments: 8,
        currentAppointments: 0,
        timezone: 'UTC',
        location: 'Neurology Department',
        isVirtual: false,
      },
    }),
  ]);

  console.log('📋 Created availability slots:', availabilitySlots.length);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Patients: ${patients.length}`);
  console.log(`- Providers: ${providers.length}`);
  console.log(`- Appointments: ${appointments.length}`);
  console.log(`- Availability Settings: ${providers.length}`);
  console.log(`- Availability Slots: ${availabilitySlots.length}`);

  console.log('\n🔑 Demo Account Credentials:');
  console.log('Password for all accounts: Demo123!@#');
  console.log('\nPatients:');
  patients.forEach(patient => {
    console.log(`- ${patient.firstName} ${patient.lastName}: ${patient.email}`);
  });
  console.log('\nProviders:');
  providers.forEach(provider => {
    console.log(`- ${provider.firstName} ${provider.lastName}: ${provider.email}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 