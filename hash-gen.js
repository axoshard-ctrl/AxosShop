import bcrypt from 'bcrypt';

(async () => {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
})();
