import { User } from '../models/User.js';

export async function seedAdminAccount() {
  try {
    // Check if an admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin account already exists. Skipping seed.');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      console.error('Cannot seed admin account: ADMIN_EMAIL or ADMIN_PASSWORD missing from environment variables.');
      return;
    }

    // Create the admin account
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      department: 'Exam Operations',
      avatar: adminName.substring(0, 2).toUpperCase()
    });

    console.log(`Admin account seeded successfully: ${adminEmail}`);
  } catch (error) {
    console.error('Failed to seed admin account:', error);
  }
}
