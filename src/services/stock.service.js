const prisma = require("../config/prisma");
const dateConvert = require("../lib/dateconvert");

const findProductId = async (productName) => {
  const productId = await prisma.products.findFirst({
    where: {
      name: productName,
    },
    select: {
      id: true,
    },
  });

  if (!productId) {
    return null;
  }
  return productId.id;
};

exports.createStock = async (stockData) => {
  const { product, transactionType, quantity } = stockData;
  const costPerUnit = stockData.costPerUnit;

  //valid input
  if (!product || !transactionType || !quantity) {
    return { success: false, status: 400, message: "Missing product data" };
  }

  const productId = await findProductId(product);
  if (productId === null) {
    return { success: false, status: 400, message: "product doesn't exist" };
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

    //update current stock
    let newQuantity;
    if (transactionType === "increase") {
      newQuantity = {
        increment: quantity,
      };
    } else if (transactionType === "decrease") {
      newQuantity = {
        decrement: quantity,
      };
    }
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
