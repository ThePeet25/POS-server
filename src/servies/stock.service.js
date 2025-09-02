const prisma = require("../config/prisma");

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

function formatDateToGMT7(dateString) {
  const date = new Date(dateString);

  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const day = String(gmt7.getDate()).padStart(2, "0");
  const month = String(gmt7.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0
  const year = gmt7.getFullYear();

  return `${day}-${month}-${year}`;
}

function parseDateDDMMYYYY(dateStr) {
  // dateStr เช่น "02-09-2025"
  const [day, month, year] = dateStr.split("-").map(Number);

  // สร้าง Date ที่เป็นเวลาตาม GMT+7 (00:00 ของวันนั้น)
  const date = new Date(Date.UTC(year, month - 1, day));
  return date;
}

exports.createStock = async (stockData) => {
  const { product, transactionType, quantity } = stockData;
  const costPerUnit = stockData.costPerUnit;

  //valid input
  if (!product || !transactionType || !quantity) {
    return { success: false, status: 400, message: "Missing product data" };
  }

  const productId = await findProductId(product);
  if (productId === null) {
    return { success: false, status: 400, message: "product doesnt exsist" };
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
    //convert string dd-mm-yyyy to GMT+7 Date
    const parsedDate = parseDateDDMMYYYY(date);
    console.log(parsedDate);

    // change gmt + 7 to gmt via - 7 hour
    const startDate = new Date(parsedDate.getTime() - 7 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    console.log(startDate);
    console.log(endDate);

    whereClause.transactionDate = {
      gte: startDate,
      lte: endDate,
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
    transactionDate: formatDateToGMT7(data.transactionDate),
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
