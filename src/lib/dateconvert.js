class DateConverter {
  constructor(offsetHours = 7 * 60 * 60 * 1000) {
    this.offsetHours = offsetHours;
  }

  /*
    @param {string} dateStr - "2025-09-02"
    @returns {date} Date object GMT0
    */
  toGMT0(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);

    const localDate = new Date(Date.UTC(year, month - 1, day));

    const startUtcDate = new Date(localDate.getTime() - this.offsetHours);
    const endUtcDate = new Date(
      startUtcDate.getTime() + 24 * 60 * 60 * 1000 - 1
    );

    // localDate.setUTCHours(localDate.getHours() - this.offsetHours);

    return { startUtcDate, endUtcDate };
  }

  /*
  @param {String} date - gmt+0
  @return {string} "yyyy-mm-dd" gmt+7
  */
  toGMT7String(dateStr) {
    const date = new Date(dateStr);

    const localDate = new Date(date.getTime() + this.offsetHours);

    const year = localDate.getFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(localDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}

const dateConvert = new DateConverter();
module.exports = dateConvert;
