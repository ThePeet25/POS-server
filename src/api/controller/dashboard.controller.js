const dashboardService = require("../../services/dashboard.service");

exports.getDaySummery = async (req, res) => {
  try {
    const result = await dashboardService.getDaySummery();

    res.status(200).json({
      ...result,
    });
  } catch (error) {
    console.error("Error during get day summery ERROR:", error);
    res.status(500).json({
      message: "Error during get day summery",
    });
  }
};

exports.getMonthYear = async (req, res) => {
  try {
    const result = await dashboardService.getMonthYear();
    console.log(result);

    res.status(200).json({ ...result });
  } catch (error) {
    console.error("Error during get month year ERROR:", error);
    res.status(500).json({
      message: "Error during get month year",
    });
  }
};

exports.get7DayMonthYear = async (req, res) => {
  const dateType = req.params.dateType;

  if (!dateType) {
    return res.status(400).json({
      message: "Missing data type",
    });
  }

  try {
    const result = await dashboardService.get7DayMonthYear(dateType);

    res.status(200).json({
      date: result,
    });
  } catch (error) {
    console.error("Error during get data ERROR:", error);
    res.status(500).json({
      message: "Error during get data ",
    });
  }
};
