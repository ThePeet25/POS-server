const prisma = require("../config/prisma");
const { DateType, TotalType } = require("../generated/prisma");
const dateConvert = require("../lib/dateconvert");

exports.getDaySummery = async () => {
  const today = dateConvert.toGMT7String(new Date());
  const { startUtcDate, endUtcDate } = dateConvert.toGMT0(today);

  const totalDayIncome = await prisma.totalLookup.findFirst({
    where: {
      dateType: DateType.Day,
      dateValue: today,
    },
    select: {
      value: true,
    },
  });

  const totalOrder = await prisma.orders.aggregate({
    _count: {
      createdAt: true,
    },
    where: {
      createdAt: {
        gte: startUtcDate,
        lte: endUtcDate,
      },
    },
  });

  const totalProduct = await prisma.orderItems.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      order: {
        createdAt: {
          gte: startUtcDate,
          lte: endUtcDate,
        },
      },
    },
  });

  // console.log(totalDayIncome);
  // console.log(totalOrder);
  // console.log(totalProduct);
  return {
    income: totalDayIncome?.value ?? 0,
    order: totalOrder._count.createdAt || 0,
    product: totalProduct._sum.quantity || 0,
  };
};

exports.getMonthYear = async () => {
  const [year, month] = dateConvert.toGMT7String(new Date()).split("-");
  const lastMonth = String(((parseInt(month) + 10) % 12) + 1).padStart(2, "0");

  const monthIncome = await prisma.totalLookup.findMany({
    where: {
      AND: [
        {
          dateType: DateType.Month,
          OR: [
            {
              dateValue: `${year}-${month}`,
            },
            {
              dateValue: `${year}-${lastMonth}`,
            },
          ],
        },
      ],
    },
    select: {
      value: true,
    },
  });

  console.log(monthIncome);

  const yearIncome = await prisma.totalLookup.findFirst({
    where: {
      dateType: DateType.Year,
      dateValue: year,
    },
    select: {
      value: true,
    },
  });

  return {
    month: {
      thisMonth: monthIncome[1]?.value ?? "0",
      lastMonth: monthIncome[0]?.value ?? "0",
    },
    year: yearIncome?.value ?? "0",
  };
};

exports.get7DayMonthYear = async (dateType) => {
  let before7;
  let before7LastMonth;
  let WhereClause = {};

  if (dateType === "Day") {
    before7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().split("T")[0];
    });

    before7LastMonth = before7.map((dateStr) => {
      const d = new Date(dateStr);
      d.setUTCMonth(d.getUTCMonth() - 1);
      return d.toISOString().split("T")[0];
    });

    WhereClause = {
      dateType: DateType.Day,
      dateValue: {
        in: [...before7, ...before7LastMonth],
      },
    };
  } else if (dateType === "Month") {
    before7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCMonth(d.getUTCMonth() - i);
      return d.toISOString().slice(0, 7);
    });

    WhereClause = {
      dateType: DateType.Month,
      dateValue: {
        in: before7,
      },
    };
  } else if (dateType === "Year") {
    before7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCFullYear(d.getUTCFullYear() - i);
      return d.toISOString().slice(0, 4);
    });

    WhereClause = {
      dateType: DateType.Year,
      dateValue: {
        in: before7,
      },
    };
  } else {
    throw new Error("Error date type not match");
  }

  const result = await prisma.totalLookup.findMany({
    where: WhereClause,
    select: {
      id: true,
      dateValue: true,
      value: true,
    },
  });

  let i = 1;
  const final = before7.map((data) => {
    const found = result.find((r) => r.dateValue === data);
    return {
      id: i++,
      date: data,
      value: found ? String(found.value) : "0",
      // value: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
    };
  });

  if (dateType === "Day") {
    const mapLastMonth = before7LastMonth.map((date) => {
      const found = result.find((d) => d.dateValue === date);
      return {
        id: i++,
        date,
        value: found ? String(found.value) : "0",
        // value: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
      };
    });

    return {
      thisMonth: final,
      lastMonth: mapLastMonth,
    };
  } else {
    return final;
  }
};
