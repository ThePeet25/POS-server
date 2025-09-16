const prisma = require("../config/prisma");
const dateConvert = require("../lib/dateconvert");
// import { Prisma } from '@prisma/client';
const { PromotionStatus } = require("../generated/prisma");

exports.createNewPromotion = async (promotionData) => {
  try {
    //step 1 find product id from name
    // find product id
    const product = await prisma.products.findFirst({
      where: {
        OR: [
          { name: promotionData.product },
          { barcode: promotionData.barcode },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!product || product.length === 0) {
      return {
        success: false,
        status: 400,
        message:
          "can't find product name, pls make sure you enter product correctly",
      };
    }

    const isHavePromotion = await prisma.productPromotions.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (isHavePromotion) {
      return {
        success: false,
        status: 400,
        message: "this product is already have promotion",
      };
    }
    //step 2 create promotion
    //input enum validate
    const inputDiscountType = ["PERCENT", "FIXED"];
    if (!inputDiscountType.includes(promotionData.discountType)) {
      return {
        success: false,
        status: 400,
        message: "discount type doesn't have",
      };
    }

    //discount valid
    if (promotionData.discountType === "PERCENT") {
      if (promotionData.discountValue >= 100) {
        return {
          success: false,
          status: 400,
          message: "discount percent type can't more than 100",
        };
      }
    }

    const UTC = new Date();
    const start = dateConvert.toGMT0(promotionData.startDate).startUtcDate;
    const end = dateConvert.toGMT0(promotionData.endDate).endUtcDate;
    let status = "ACTIVE";
    if (UTC >= start && UTC <= end) {
      status = "ACTIVE";
    } else if (UTC < start) {
      status = "UPCOMING";
    } else {
      status = "EXPIRED";
    }

    //create promotion
    const newPromotion = await prisma.promotions.create({
      data: {
        name: promotionData.name || null,
        startDate: start,
        endDate: end, // แปลงเป็น Date object
        // status จะใช้ค่า default "upcoming" หรือคุณจะส่งมาเองก็ได้
        status,
        discountType: promotionData.discountType,
        discountValue: promotionData.discountValue,
        remainingQuota: promotionData.remainingQuota || null,
      },
    });

    //step 3 join product and promotion in prodcutPromotion table
    const joinData = await prisma.productPromotions.create({
      data: {
        productId: product.id,
        promotionId: newPromotion.id,
      },
    });
    return { success: true, promotion: newPromotion };
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
};

exports.getPromotions = async (limit, page, search, date) => {
  //1. set offset
  // const offset = (page - 1) * limit;

  let whereClause = {};

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

  if (date) {
    const { startUtcDate, endUtcDate } = dateConvert.toGMT0(date);

    whereClause.promotion = {
      startDate: {
        gte: startUtcDate,
        lte: endUtcDate,
      },
    };
  }

  try {
    const result = await prisma.productPromotions.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
      select: {
        product: {
          select: {
            name: true,
            quantity: true,
          },
        },
        promotion: {
          select: {
            startDate: true,
            endDate: true,
            discountType: true,
            discountValue: true,
            remainingQuota: true,
          },
        },
      },
    });

    return result.map((data) => ({
      startDate: dateConvert.toGMT7String(data.promotion.startDate),
      endDate: dateConvert.toGMT7String(data.promotion.endDate),
      product: data.product.name,
      discountType: data.promotion.discountType,
      discountValue: data.promotion.discountValue,
      quota: data.promotion.remainingQuota,
    }));
  } catch (err) {
    console.error("Failed from promotion service ERROR:", err);
    throw err;
  }
};

exports.updatePromotionStatuses = async () => {
  try {
    const current = new Date();
    const upcomingToActive = await prisma.promotions.updateMany({
      where: {
        status: PromotionStatus.UPCOMING,
        startDate: {
          lte: current,
        },
      },
      data: {
        status: PromotionStatus.ACTIVE,
        updatedAt: current,
      },
    });

    console.log(
      `Updated ${upcomingToActive.count} upcoming promotions to active.`
    );

    const activeToExpired = await prisma.promotions.updateMany({
      where: {
        status: PromotionStatus.ACTIVE,
        endDate: {
          lt: current,
        },
      },
      data: {
        status: PromotionStatus.EXPIRED,
        updatedAt: current,
      },
    });

    console.log(
      `Updated ${activeToExpired.count} active promotions to expired.`
    );

    const expiredPromotions = await prisma.promotions.findMany({
      where: {
        status: PromotionStatus.EXPIRED,
      },
      select: {
        id: true,
      },
    });

    const expiredPromotionIds = expiredPromotions.map((p) => p.id);

    if (expiredPromotionIds.length > 0) {
      const deleteProductPromotions = prisma.productPromotions.deleteMany({
        where: {
          promotionId: { in: expiredPromotionIds },
        },
      });
      console.log(
        `Deleted ${deleteProductPromotions.count} product_promotions links for expired promotions.`
      );
    }
  } catch (err) {
    console.error("Error during update promotions status ERROR:", err);
    // throw err;
  }
};
