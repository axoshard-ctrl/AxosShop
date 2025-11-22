import { storage } from './server/storage';

async function check() {
  const users = await storage.getAllUsers();
  console.log('Total users:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} (admin: ${user.isAdmin})`);
  });
  
  const newAdmin = await storage.getUserByEmail('newadmin@axosshop.com');
  console.log('\nNew admin user:');
  console.log('Found:', !!newAdmin);
  console.log('Email:', newAdmin?.email);
  console.log('IsAdmin:', newAdmin?.isAdmin);
  console.log('Password hash (first 20 chars):', newAdmin?.password?.substring(0, 20));
}

check().catch(console.error);
