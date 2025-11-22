import bcrypt from 'bcrypt';

async function test() {
  // Test the original admin password
  const hashedFromSeed = '$2b$10$.1aG/amJ7DL7FgHnLL1Yd.zEcXOyDUlEgk0BdjJAV6yH6VyizNyn.';
  const isValid = await bcrypt.compare('admin123', hashedFromSeed);
  console.log('Original admin password matches:', isValid);
}

test().catch(console.error);
