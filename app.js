//import dependencies
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

//import file
const users = require("./src/api/routes/users.routes");
const products = require("./src/api/routes/products.routes");
const categories = require("./src/api/routes/category.routes");
const promotions = require("./src/api/routes/promotion.routes");
const stock = require("./src/api/routes/stock.routes");
const setup = require("./src/api/routes/setup.routes");
const order = require("./src/api/routes/order.routes");
const dashboard = require("./src/api/routes/dashboard.routes");
const totalLookup = require("./src/lib/totallookup");

const app = express();

//variable
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONT_END, "http://localhost:3000"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/user", users);
app.use("/product", products);
app.use("/category", categories);
app.use("/promotion", promotions);
app.use("/stock", stock);
app.use("/order", order);
app.use("/setup", setup);
app.use("/dashboard", dashboard);

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

app.listen(PORT, () => {
  totalLookup.generateLookups();
  console.log("App running on", PORT);
});
