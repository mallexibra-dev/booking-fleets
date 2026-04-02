const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Seed Database
 * Run with: node prisma/seed.js
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.approval.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fleet.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  const approver1 = await prisma.user.create({
    data: {
      email: 'manager1@fleet.com',
      password: hashedPassword,
      name: 'John Manager',
      role: 'APPROVER',
    },
  });

  const approver2 = await prisma.user.create({
    data: {
      email: 'manager2@fleet.com',
      password: hashedPassword,
      name: 'Sarah Supervisor',
      role: 'APPROVER',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@fleet.com',
      password: hashedPassword,
      name: 'Mike Employee',
      role: 'EMPLOYEE',
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@fleet.com',
      password: hashedPassword,
      name: 'Lisa Worker',
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Created 5 users');

  // Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      name: 'Toyota Camry',
      plateNumber: 'ABC-123',
      type: 'Sedan',
      capacity: 4,
      status: 'AVAILABLE',
      description: 'Comfortable sedan for city trips',
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      name: 'Honda Odyssey',
      plateNumber: 'DEF-456',
      type: 'Van',
      capacity: 7,
      status: 'AVAILABLE',
      description: 'Spacious van for group trips',
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      name: 'Ford F-150',
      plateNumber: 'GHI-789',
      type: 'Truck',
      capacity: 3,
      status: 'AVAILABLE',
      description: 'Heavy-duty truck for cargo',
    },
  });

  console.log('✅ Created 3 vehicles');

  // Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: 'Robert Driver',
      phone: '+1234567890',
      licenseNo: 'DL-12345',
      status: 'AVAILABLE',
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'James Chauffeur',
      phone: '+0987654321',
      licenseNo: 'DL-67890',
      status: 'AVAILABLE',
    },
  });

  console.log('✅ Created 2 drivers');

  // Create a sample booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setHours(17, 0, 0, 0);

  const booking = await prisma.booking.create({
    data: {
      title: 'Client Meeting - Downtown Office',
      purpose: 'Meeting with potential client at their downtown office to discuss project proposal',
      startTime: tomorrow,
      endTime: dayAfterTomorrow,
      pickupLocation: 'Main Office - 123 Business Ave',
      dropoffLocation: 'Downtown Office - 456 Commerce St',
      passengerCount: 3,
      status: 'PENDING',
      userId: employee1.id,
      createdById: employee1.id,
      vehicleId: vehicle1.id,
      notes: 'Please arrive 15 minutes early',
    },
  });

  // Create approval chain for the booking
  await prisma.approval.create({
    data: {
      bookingId: booking.id,
      approverId: approver1.id,
      level: 1,
      status: 'PENDING',
    },
  });

  await prisma.approval.create({
    data: {
      bookingId: booking.id,
      approverId: approver2.id,
      level: 2,
      status: 'PENDING',
    },
  });

  console.log('✅ Created sample booking with approval chain');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials (email | password):');
  console.log('   Admin:     admin@fleet.com | password123');
  console.log('   Approver:  manager1@fleet.com | password123');
  console.log('   Employee:  employee1@fleet.com | password123');
  console.log('\n📊 Sample Data:');
  console.log('   - 5 users (1 admin, 2 approvers, 2 employees)');
  console.log('   - 3 vehicles');
  console.log('   - 2 drivers');
  console.log('   - 1 booking with 2-level approval chain');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
