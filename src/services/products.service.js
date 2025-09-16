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

const priceCalculate = (price, Promotions) => {
  let discountPrice;
  if (Promotions.discountType === "PERCENT") {
    discountPrice =
      Math.round((price - (Promotions.discountValue / 100) * price) * 100) /
      100;
  } else {
    discountPrice = price - Promotions.discountValue;
  }
  return discountPrice;
};

exports.createNewProduct = async (
  name,
  author,
  price,
  barcode,
  quantity = 0,
  category,
  detail
) => {
  // check unique product
  const existingProducts = await prisma.products.findFirst({
    where: {
      AND: [{ barcode }, { isDeleted: false }],
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
      detail,
    },
  });

  return { success: true, status: 200, name: newProduct.name };
};

exports.getProducts = async (
  page,
  limit,
  category = null,
  sortBy = "name",
  sortOrder = "asc",
  search = null
) => {
  const offset = (page - 1) * limit;
  const whereClause = {
    isDeleted: false,
  };

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

  if (search) {
    whereClause.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        barcode: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
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
      if (isHavePromotion !== null) {
        let discountPrice = priceCalculate(
          data.price,
          isHavePromotion.promotion
        );

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
  //1. query product
  const productData = await prisma.products.findFirst({
    where: {
      AND: [
        { isDeleted: false },
        {
          barcode: { contains: product, mode: "insensitive" },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      price: true,
      barcode: true,
      productPromotions: {
        select: {
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

  if (productData === null) {
    return false;
  }

  //2. map result
  let productResult = {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    barcode: productData.barcode,
  };

  //3. add promotion price if have
  const isHavePromotion = productData.productPromotions[0] || null;

  let discountPrice;
  if (isHavePromotion !== null) {
    discountPrice = priceCalculate(
      productData.price,
      isHavePromotion.promotion
    );

    productResult.promotionPrice = discountPrice;
  }

  //4. return result
  return productResult;
};

exports.getProductInfo = async (id) => {
  //1. query restaurant
  const product = await prisma.products.findFirst({
    where: {
      AND: [{ id }, { isDeleted: false }],
    },
    select: {
      id: true,
      name: true,
      price: true,
      author: true,
      detail: true,
      quantity: true,
      category: {
        select: {
          name: true,
        },
      },
      productPromotions: {
        select: {
          promotion: {
            select: {
              discountType: true,
              discountValue: true,
            },
          },
        },
      },
    },
  });

  //2. map product
  let productInfo = {
    id,
    name: product.name,
    price: product.price,
    author: product.author,
    quantity: product.quantity,
    category: product.category.name,
    detail: product.detail,
  };

  //3. add promotion price if have
  const isHavePromotion = product.productPromotions[0] || null;
  if (isHavePromotion) {
    let discountPrice = priceCalculate(
      product.price,
      isHavePromotion.promotion
    );

    productInfo.discountType = isHavePromotion.promotion.discountType;
    productInfo.discountValue = isHavePromotion.promotion.discountValue;
    productInfo.discountPrice = discountPrice;
  }

  return productInfo;
};

exports.deleteProduct = async (id) => {
  await prisma.products.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};
