class DateConverter {
  constructor(offsetHours = 7) {
    this.offsetHours = offsetHours;
  }

  /*
    @param {string} dateStr - "2025-09-02"
    @returns {date} Date object GMT0
    */
  toGMT0(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);

    const localDate = new Date(Date.UTC(year, month - 1, day));

    localDate.setUTCHours(localDate.getHours() - this.offsetHours);

    return localDate;
  }

  /*
  @param {Date} date - Date object gmt+0
  @return {string} "yyyy-mm-dd" gmt+7
  */
  toGMT7String(date) {
    const localDate = new Date(
      date.getTime() + this.offsetHours * 60 * 60 * 1000
    );

    const year = localDate.getFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(localDate.getUTCDay()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
