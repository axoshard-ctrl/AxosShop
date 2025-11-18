import { db } from "./db";
import { products } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if products already exist
  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  // Seed products
  const initialProducts = [
    {
      name: "Purple Axolotl Tote Bag",
      description: "Carry your essentials in style with this adorable purple axolotl tote bag. Perfect for shopping, beach days, or everyday use.",
      price: "24.99",
      imageUrl: "/attached_assets/product-tote-purple-axolotl_1762939233931.png",
      stock: 50,
      isActive: true,
    },
    {
      name: "Axo Shard Coffee Mug",
      description: "Start your morning right with this charming purple axolotl mug. Holds 11oz of your favorite beverage.",
      price: "14.99",
      imageUrl: "/attached_assets/product-mug-purple-axolotl_1762939234045.png",
      stock: 100,
      isActive: true,
    },
    {
      name: "Axolotl Sticker Pack",
      description: "Set of 5 waterproof vinyl stickers featuring cute purple axolotls in various poses. Perfect for laptops, water bottles, and more!",
      price: "8.99",
      imageUrl: "/attached_assets/product-stickers-purple-axolotl_1762939234151.png",
      stock: 200,
      isActive: true,
    },
    {
      name: "Purple Axolotl Hoodie",
      description: "Stay cozy with this ultra-soft hoodie featuring an embroidered purple axolotl design. Made from premium cotton blend.",
      price: "49.99",
      imageUrl: "/attached_assets/product-hoodie-purple-axolotl_1762939234370.png",
      stock: 30,
      isActive: true,
    },
    {
      name: "Axo Shard T-Shirt",
      description: "Classic crew neck t-shirt with vibrant purple axolotl print. Comfortable, breathable, and perfect for axolotl lovers!",
      price: "22.99",
      imageUrl: "/attached_assets/product-tshirt-purple-axolotl_1762939234479.png",
      stock: 75,
      isActive: true,
    },
    {
      name: "Purple Axolotl Phone Case",
      description: "Protect your phone with this durable case featuring an adorable purple axolotl design. Available for most phone models.",
      price: "18.99",
      imageUrl: "/attached_assets/product-phonecase-purple-axolotl_1762939234584.png",
      stock: 60,
      isActive: true,
    },
    {
      name: "Axolotl Plushie",
      description: "Super soft and huggable 12-inch purple axolotl plushie. Perfect gift for axolotl enthusiasts of all ages!",
      price: "29.99",
      imageUrl: "/attached_assets/product-plushie-purple-axolotl_1762939234260.png",
      stock: 40,
      isActive: true,
    },
  ];

  await db.insert(products).values(initialProducts);

  console.log(`Seeded ${initialProducts.length} products successfully!`);
}

seed()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
