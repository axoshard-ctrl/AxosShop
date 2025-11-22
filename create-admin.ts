import { storage } from "./server/storage";
import bcrypt from "bcrypt";

async function createAdmin() {
  const email = process.argv[2] || "admin@axosshop.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  console.log(`Creating admin account...`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${name}`);

  try {
    // Check if user exists
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      if (existing.isAdmin) {
        console.log("✓ User already exists and is admin");
        return;
      }
      // Make existing user admin
      const updated = await storage.makeAdmin(existing.id);
      console.log("✓ Admin account created for existing user:", updated?.email);
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
    });

    await storage.makeAdmin(user.id);
    console.log("✓ Admin account created successfully!");
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
  } catch (error) {
    console.error("Error creating admin account:", error);
    process.exit(1);
  }
}

createAdmin();
