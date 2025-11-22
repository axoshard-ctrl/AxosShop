import bcrypt from 'bcrypt';
import { storage } from './server/storage';

async function test() {
  const password = 'admin123';
  const email = 'newadmin@axosshop.com';
  
  const user = await storage.getUserByEmail(email);
  console.log('User found:', !!user);
  console.log('User email:', user?.email);
  console.log('User password hash:', user?.password);
  console.log('User isAdmin:', user?.isAdmin);
  
  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password match:', isValid);
  }
}

test().catch(console.error);
