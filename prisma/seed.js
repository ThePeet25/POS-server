// Import faker (JavaScript style)
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
// Import Prisma Client
const { PrismaClient, Prisma } = require("../src/generated/prisma");
const prisma = new PrismaClient();

function randomDateInLast3Years() {
  const now = new Date();
  const past = new Date();
  past.setFullYear(now.getFullYear() - 3);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

function randomReceiptId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function main() {
  console.log("Start seed");
  try {
    await prisma.$transaction(async (prisma) => {
      //1 delete data
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "orders" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "order_items" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "stock_transactions" RESTART IDENTITY CASCADE;`
      );
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "total_lookup" RESTART IDENTITY CASCADE;`
      );
      console.log("Cleared existing data.");

      //2 create user
      const user = [
        {
          username: "admin",
          password: await bcrypt.hash("admin1234", 10),
          role: "manager",
        },
        {
          username: "cashier",
          password: await bcrypt.hash("cashier1234", 10),
        },
      ];
      await prisma.users.createMany({
        data: user,
        skipDuplicates: true,
      });

      //3 create category
      const newCategories = await prisma.categories.createMany({
        data: [
          { name: "Anime" },
          { name: "Finance" },
          { name: "Self-development" },
          { name: "Education" },
        ],
      });

      //4 create product
      const numberOfProducts = 5000; // You can change this to 10000 or any number
      const productsToCreate = [];

      for (let i = 0; i < numberOfProducts; i++) {
        const product = {
          name: faker.commerce.productName(),
          author: faker.person.fullName(), // Using person.fullName for author
          price: new Prisma.Decimal(
            faker.commerce.price({ min: 100, max: 1000, dec: 2 })
          ), // Price between 100 and 1000, no decimals
          barcode: faker.string.numeric(13), // 13-digit barcode
          quantity: faker.number.int({ min: 10, max: 200 }), // Quantity between 10 and 200
          categoryId: faker.number.int({ min: 1, max: 4 }), // Assign the actual category ID
          detail: faker.commerce.productDescription(),
        };
        productsToCreate.push(product);
      }

      const createdProducts = await prisma.products.createMany({
        data: productsToCreate,
        skipDuplicates: true, // Optionally skip if unique constraint violated (e.g. barcode)
      });
      console.log(`Created ${createdProducts.count} products.`);

      //5. create order and order item
      const numberOfOrder = 50;
      for (let i = 0; i < 50; i++) {
        const createdAt = randomDateInLast3Years();
        //create order
        const order = await prisma.orders.create({
          data: {
            receiptId: randomReceiptId(),
            userId: 2,
            totalAmount: 0,
            createdAt,
          },
        });

        //create order list
        const itemCount = Math.floor(Math.random() * 5) + 1;
        let totalAmount = 0;
        for (let j = 0; j < itemCount; j++) {
          const quantity = Math.floor(Math.random() * 5) + 1;
          const productId = Math.floor(Math.random() * 3000) + 1;
          const price = await prisma.products.findFirst({
            where: {
              id: productId,
            },
            select: {
              price: true,
            },
          });

          if (price === null) {
            continue;
          }
          await prisma.orderItems.create({
            data: {
              orderId: order.id,
              productId,
              quantity,
              price: price.price,
            },
          });

          totalAmount += quantity * price.price;
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              totalAmount,
            },
          });
        }
      }

      //6. create stock transactions
    });
  } catch (err) {
    console.error("Error during setup ERROR:", err);
  }

  console.log("Seeding finished.");
}

// Execute the main function
main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
