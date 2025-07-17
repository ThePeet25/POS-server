productService = require('../../servies/products.service');

exports.createProduct = async (req, res) => {
    const productData = req.body;

    //valid data
    if(!productData || productData.length === 0){
        return res.status(400).json({ meassage: 'missing product data'})
    }

    try {
        const result = await productService.createNewProduct(productData);

        if(!result.success) {
            return res.status(result.status).json({ message: result.message})
        }

        res.status(201).json({
            message: 'Create product successful!!!',
            product: result.name
        })
    } catch(err) {
        console.log('ERROR', err)

        res.status(500).json({
            message: 'Failed to create product',
            error: err
        })
    }
}