const prisma = require("../config/prisma");

//find category id from name
const findCategoryId = async (category) => {
  const categoryId = await prisma.categories.findFirst({
    where: {
      name: category,
    },
    select: {
      id: true,
    },
  });

  if (!categoryId) {
    return null;
  }

  return categoryId.id;
};

exports.createNewProduct = async (productData) => {
  const { name, author, price, barcode, quantity, category } = productData;

  // check unique product
  const existingProducts = await prisma.products.findFirst({
    where: {
      OR: [{ barcode }],
    },
  });

  if (existingProducts) {
    return {
      success: false,
      status: 400,
      message: "Product already exists(barcode).",
    };
  }

  const categoryId = await findCategoryId(category);
  if (categoryId === null) {
    return { success: false, status: 400, message: "Category doesn't exists." };
  }

  const newProduct = await prisma.products.create({
    data: {
      name,
      author,
      price,
      barcode,
      quantity,
      categoryId,
    },
  });

  return { success: true, status: 200, name: newProduct.name };
};

exports.getProducts = async (
  page,
  limit,
  category = null,
  sortBy = "name",
  sortOrder = "asc"
) => {
  const offset = (page - 1) * limit;
  const whereClause = {};

  //check have category id
  if (category !== null) {
    const categoryId = await findCategoryId(category);
    if (categoryId === null) {
      return {
        success: false,
        status: 400,
        message: "Category doesn't exists.",
      };
    } else {
      whereClause.categoryId = categoryId;
    }
  }

  // Build the ORDER BY clause
  const orderByClause = {};
  orderByClause[sortBy] = sortOrder;

  try {
    //find total product
    const totalProducts = await prisma.products.count({
      where: whereClause,
    });

    //get products
    const productsWithPromotions = await prisma.products.findMany({
      // where:{
      //     id: 803
      // },
      // เพิ่ม select block ที่นี่
      skip: offset,
      take: limit,
      where: whereClause,
      orderBy: orderByClause,
      select: {
        // เลือกคอลัมน์ที่คุณต้องการจากตาราง 'products'
        id: true,
        name: true,
        author: true, // เพิ่มคอลัมน์ author
        price: true,
        barcode: true, // เพิ่มคอลัมน์ barcode
        quantity: true, // เพิ่มคอลัมน์ quantity

        // ยังคงรวมความสัมพันธ์ 'productPromotions' เข้าไปด้วย
        productPromotions: {
          include: {
            promotion: {
              select: {
                name: true,
                // startDate: true,
                // endDate: true,
                // status: true,
                discountType: true,
                discountValue: true,
                remainingQuota: true,
              },
            },
          },
        },
        // ถ้าต้องการ select category เพิ่มเข้ามา
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // console.log(JSON.stringify(productsWithPromotions, null, 2));
    const products = productsWithPromotions.map((data) => {
      const isHavePromotion = data.productPromotions[0] || null;
      let discountPrice;
      if (isHavePromotion !== null) {
        if (isHavePromotion.promotion.discountType === "PERCENT") {
          discountPrice =
            Math.round(
              (data.price -
                (isHavePromotion.promotion.discountValue / 100) * data.price) *
                100
            ) / 100;
        } else {
          discountPrice = data.price - isHavePromotion.promotion.discountValue;
        }
        return {
          id: data.id,
          name: data.name,
          author: data.author,
          price: data.price,
          promotionPrice: discountPrice,
          barcode: data.barcode,
          quantity: data.quantity,
          category: data.category.name,
        };
      }
      return {
        id: data.id,
        name: data.name,
        author: data.author,
        price: data.price,
        barcode: data.barcode,
        quantity: data.quantity,
        category: data.category.name,
      };
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      products,
      totalProducts,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    };
  } catch (err) {
    console.error("Error in productService.getAllProductsPaginated:", err);
    throw err;
  }
};

exports.getOneProduct = async (product) => {
  const productData = await prisma.products.findFirst({
    where: {
      OR: [{ name: product }, { barcode: product }],
    },
    select: {
      name: true,
      price: true,
      barcode: true, // เพิ่มคอลัมน์ barcode
      productPromotions: {
        include: {
          promotion: {
            select: {
              discountType: true,
              discountValue: true,
              remainingQuota: true,
            },
          },
        },
      },
    },
  });

  const isHavePromotion = productData.productPromotions[0] || null;
  let discountPrice;
  if (isHavePromotion !== null) {
    if (isHavePromotion.promotion.discountType === "PERCENT") {
      discountPrice =
        Math.round(
          (productData.price -
            (isHavePromotion.promotion.discountValue / 100) *
              productData.price) *
            100
        ) / 100;
    } else {
      discountPrice =
        productData.price - isHavePromotion.promotion.discountValue;
    }
    return {
      id: productData.id,
      name: productData.name,
      price: productData.price,
      promotionPrice: discountPrice,
      barcode: productData.barcode,
    };
  }

  return {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    barcode: productData.barcode,
  };
};
