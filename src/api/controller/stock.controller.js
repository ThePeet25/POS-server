const stockService = require('../../servies/stock.service')


exports.createStock = async(req, res) => {
    const stockData = req.body;
    if(stockData === undefined) {
        return res.status(400).json({ message: 'Missing stock data'})
    }
    try {
        const result = await stockService.createStock(stockData);

        if(!result.success) {
            res.status(result.status).json({ message: result.message})
        }
        res.status(201).json({
            message: 'Stock was created',
            product: result.product
        })
    } catch(err) {
        console.error('Error during create stock ERROR:', err)
        res.status(500).json({
            message: 'Error during create stock',
            err: err.message
        })
    }
}