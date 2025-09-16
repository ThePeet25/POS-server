const express = require("express");

const router = express.Router();

const productController = require("../controller/products.controller");
const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

router.post(
  "/create",
  authentication,
  authorizeRoles(["manager"]),
  productController.createProduct
);
// router.get('/getproducts', authentication, authorizeRoles(['manager', 'cashier']), productController.getProducts)
router.get("/getproducts", productController.getProducts);
router.get("/get/:barcode", productController.getOneProduct);
router.get("/information/:id", productController.getProductInfo);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
