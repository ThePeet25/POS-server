
// Import faker (JavaScript style)
const { faker } = require('@faker-js/faker');
// Import Prisma Client
const { PrismaClient, Prisma } = require('../src/generated/prisma');
const prisma = new PrismaClient();



// Your predefined categories

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data (Optional, but good for clean seeding)
  // BE CAREFUL with this in production!
//   await prisma.products.deleteMany({});
//   await prisma.categories.deleteMany({});
//   console.log('Cleared existing data.');

  
  // 3. Generate and Create Products
  const numberOfProducts = 5000; // You can change this to 10000 or any number
  const productsToCreate = [];

  for (let i = 0; i < numberOfProducts; i++) {
    const product = {
      name: faker.commerce.productName(),
      author: faker.person.fullName(), // Using person.fullName for author
      price: new Prisma.Decimal(faker.commerce.price({ min: 100, max: 1000, dec: 2 })), // Price between 100 and 1000, no decimals
      barcode: faker.string.numeric(13), // 13-digit barcode
      quantity: faker.number.int({ min: 10, max: 200 }), // Quantity between 10 and 200
      categoryId: faker.number.int({ min: 1, max: 4 }), // Assign the actual category ID
    };
    productsToCreate.push(product);

    // To prevent "Too many requests" if doing one by one, we'll batch
    // console.log(`Generated product ${i + 1}: ${product.name}`);
  }

  // Batch insert products for better performance
  // Note: createMany does not return the created records, only count
  const createdProducts = await prisma.products.createMany({
    data: productsToCreate,
    skipDuplicates: true, // Optionally skip if unique constraint violated (e.g. barcode)
  });
  console.log(`Created ${createdProducts.count} products.`);

  console.log('Seeding finished.');
}

// Execute the main function
main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });