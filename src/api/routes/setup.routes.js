const express = require("express");

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const { PrismaClient, Prisma } = require("../../generated/prisma");
const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
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
      const newUser = await prisma.users.createMany({
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
        };
        productsToCreate.push(product);
      }

      const createdProducts = await prisma.products.createMany({
        data: productsToCreate,
        skipDuplicates: true, // Optionally skip if unique constraint violated (e.g. barcode)
      });
      console.log(`Created ${createdProducts.count} products.`);
    });

    res.status(201).json({
      message: "setup success",
    });
  } catch (err) {
    console.error("Error during setup ERROR:", err);
    res.status(500).json({
      message: "Error during setup",
    });
  }
});

module.exports = router;
