productService = require('../../servies/products.service');

exports.createProduct = async (req, res) => {
    const productData = req.body;

    //valid data
    if (!productData || productData.length === 0) {
        return res.status(400).json({ meassage: 'missing product data' })
    }

    try {
        const result = await productService.createNewProduct(productData);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message })
        }

        res.status(201).json({
            message: 'Create product successful!!!',
            product: result.name
        })
    } catch (err) {
        console.log('ERROR', err)

        res.status(500).json({
            message: 'Failed to create product',
            error: err
        })
    }
}

exports.getProducts = async (req, res) => {
    try {
        //valid input
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20

        const category = req.query.category

        const sortBy = req.query.sort || 'name'
        const sortOrder = req.query.sortOrder || 'asc'

        //call services
        const { products, totalPages, currentPage, itemPerPage } = await productService.getProducts(
            page, limit, category, sortBy, sortOrder
        )

        //response 
        res.status(200).json({
            products,
            pagination: {
                totalPages,
                currentPage,
                itemPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
            }
        })
    } catch (err) {
        console.error('error fetch prodcuts fail :', err)
        res.status(500).json({ message: 'Failed to retrieve products.', err: err.message })
    }
}