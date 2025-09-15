productService = require("../../services/products.service");

exports.createProduct = async (req, res) => {
  const { name, author, price, barcode, quantity, category, detail } = req.body;

  try {
    const result = await productService.createNewProduct(
      name,
      author,
      price,
      barcode,
      quantity,
      category,
      detail
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(201).json({
      message: "Create product successful!!!",
      product: result.name,
    });
  } catch (err) {
    console.log("ERROR", err);

    res.status(500).json({
      message: "Failed to create product",
      error: err,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    //valid input
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const category = req.query.category;

    const sortBy = req.query.sort || "name";
    const sortOrder = req.query.sortOrder || "asc";
    const search = req.query.search || "";

    //call services
    const { products, totalPages, currentPage, itemPerPage } =
      await productService.getProducts(
        page,
        limit,
        category,
        sortBy,
        sortOrder,
        search
      );

    //response
    res.status(200).json({
      products,
      pagination: {
        totalPages,
        currentPage,
        itemPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (err) {
    console.error("error fetch prodcuts fail :", err);
    res
      .status(500)
      .json({ message: "Failed to retrieve products.", err: err.message });
  }
};

exports.getProductInfo = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) {
    res.status(400).json({
      message: "Missing Id",
    });
  }

  try {
    const result = await productService.getProductInfo(id);

    res.status(200).json({
      restaurant: result,
    });
  } catch (error) {
    console.log("Error during get product ERROR:", error);
    res.status(500).json({
      message: "Error during get product",
    });
  }
};

exports.getOneProduct = async (req, res) => {
  const product = req.params.barcode;
  console.log(product);

  if (!product || !product.length === 0) {
    return res.status(400).json({ message: "missing product data" });
  }

  try {
    const result = await productService.getOneProduct(product);

    if (!result) {
      return res.status(400).json({ message: "Can't find this barcode" });
    }

    res.status(200).json({
      product: result,
    });
  } catch (error) {
    console.error("Error during get product ERROR:", error);
    res.status(500).json({
      message: "Error during get product",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const name = req.body.name;

  try {
    const result = await productService.deleteProduct(name);
    res.status(200).json({
      message: "delete success",
    });
  } catch (error) {
    console.error("Error during delete product ERROR:", error);
    res.status(500).json({
      message: "Error during delete product",
    });
  }
};
