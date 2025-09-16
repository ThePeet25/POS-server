const prisma = require("../config/prisma");
const dateConvert = require("../lib/dateconvert");

const findProduct = async (productName) => {
  const product = await prisma.products.findFirst({
    where: {
      name: productName,
    },
    select: {
      id: true,
      quantity: true,
    },
  });

  if (!product) {
    return null;
  }
  return {
    id: product.id,
    quantity: product.quantity,
  };
};

exports.createStock = async (stockData) => {
  const { product, transactionType, quantity } = stockData;
  const costPerUnit = stockData.costPerUnit;

  //valid input
  if (!product || !transactionType || !quantity) {
    return { success: false, status: 400, message: "Missing product data" };
  }

  const productId = (await findProduct(product)).id;
  const productQuantity = (await findProduct(product)).quantity;
  if (productId === null) {
    return { success: false, status: 400, message: "product doesn't exist" };
  }

  //check stock type
  let newQuantity;
  if (transactionType === "increase") {
    newQuantity = {
      increment: quantity,
    };
  } else if (transactionType === "decrease") {
    if (productQuantity < quantity) {
      return {
        success: false,
        status: 400,
        message: "quantity doesn't enough",
      };
    }
    newQuantity = {
      decrement: quantity,
    };
  }

  const result = await prisma.$transaction(async (prisma) => {
    //create stock
    const newStock = await prisma.stockTransactions.create({
      data: {
        productId: productId,
        transactionType,
        quantity,
        costPerUnit: costPerUnit ? costPerUnit : null,
      },
    });

    //update stock
    const updateQuantity = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        quantity: newQuantity,
      },
    });
  });
  return { success: true, product };
};

exports.getStock = async (page, limit, search, date) => {
  const offset = (page - 1) * limit;

  let whereClause = {};

  if (date) {
    const { startUtcDate, endUtcDate } = dateConvert.toGMT0(date);

    whereClause.transactionDate = {
      gte: startUtcDate,
      lte: endUtcDate,
    };
  }

  if (search) {
    whereClause.OR = [
      {
        product: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        product: {
          barcode: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const totalStocks = await prisma.stockTransactions.count({
    where: whereClause,
  });

  const stockData = await prisma.stockTransactions.findMany({
    skip: offset,
    take: limit,
    orderBy: {
      transactionDate: "desc",
    },
    where: whereClause,
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  const stocks = stockData.map((data) => ({
    transactionDate: dateConvert.toGMT7String(data.transactionDate),
    product: data.product.name,
    quantity: data.quantity,
    transactionType: data.transactionType,
  }));

  const totalPages = Math.ceil(totalStocks / limit);
  return {
    data: stocks,
    pagination: {
      totalItems: totalStocks,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    },
  };
};
