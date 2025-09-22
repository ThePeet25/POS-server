const prisma = require("../config/prisma");
const dateConvert = require("./dateconvert");
const { DateType, TotalType } = require("../generated/prisma");
const { da, tr } = require("@faker-js/faker");

class TotalLookup {
  /*
    param {String} date yyyy-mm-dd
    */
  async updateDayIncome(date) {
    const { startUtcDate, endUtcDate } = dateConvert.toGMT0(date);

    await prisma.$transaction(async (tx) => {
      const totalDay = await tx.orders.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: startUtcDate,
            lte: endUtcDate,
          },
        },
      });

      await tx.totalLookup.upsert({
        where: {
          dateType: DateType.Day,
          dateValue: date,
        },
        update: {
          value: totalDay._sum.totalAmount || 0,
        },
        create: {
          dateType: DateType.Day,
          dateValue: date,
          value: totalDay._sum.totalAmount || 0,
          type: TotalType.Income,
        },
      });
    });
  }

  /*
  param {String} yyyy-mm
  */
  async updateMonthIncome(monthFormat) {
    const [year, month] = monthFormat.split("-").map(Number);
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    await prisma.$transaction(async (tx) => {
      const totalMonth = await tx.orders.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      if (!totalMonth._sum.totalAmount) {
        return;
      }

      await tx.totalLookup.upsert({
        where: {
          dateType: DateType.Month,
          dateValue: monthFormat,
        },
        update: {
          value: totalMonth._sum.totalAmount || 0,
        },
        create: {
          dateType: DateType.Month,
          dateValue: monthFormat,
          value: totalMonth._sum.totalAmount || 0,
          type: TotalType.Income,
        },
      });
    });
  }

  /*
  param {String} yyyy
  */
  async updateYearIncome(year) {
    const { startUtcDate: firstDay } = dateConvert.toGMT0(`${year}-01-01`);
    const { endUtcDate: lastDay } = dateConvert.toGMT0(`${year}-12-31`);

    await prisma.$transaction(async (tx) => {
      const totalYear = await tx.orders.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      await tx.totalLookup.upsert({
        where: {
          dateType: DateType.Year,
          dateValue: year,
        },
        update: {
          value: totalYear._sum.totalAmount || 0,
        },
        create: {
          dateType: DateType.Year,
          dateValue: year,
          value: totalYear._sum.totalAmount || 0,
          type: TotalType.Income,
        },
      });
    });
  }

  async generateLookups() {
    //get 7 day
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().split("T")[0];
    });

    console.log(last7Days);
    for (const day of last7Days) {
      await this.updateDayIncome(day);
    }

    //get month
    const months = await prisma.orders.findMany({
      select: {
        createdAt: true,
      },
    });

    const uniqueMonths = [
      ...new Set(
        months.map((o) => {
          const d = new Date(o.createdAt);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
            2,
            "0"
          )}`;
        })
      ),
    ];

    console.log(uniqueMonths);
    for (const month of uniqueMonths) {
      await this.updateMonthIncome(month);
    }

    //get year
    const years = [
      ...new Set(
        months.map((o) => {
          const d = new Date(o.createdAt);
          return String(d.getUTCFullYear());
        })
      ),
    ];

    console.log(years);
    for (const year of years) {
      await this.updateYearIncome(year);
    }
  }
}

const total = new TotalLookup();
// total.updateDayIncome("2024-05-09");
// total.updateMonthIncome("2024-09");
// total.updateYearIncome("2025");
module.exports = total;
