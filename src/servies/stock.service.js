const prisma = require('../config/prisma')

const findProductId = async (productName) => {
    const productId = await prisma.products.findFirst({
        where: {
            name: productName
        },
        select: {
            id: true
        }
    })

    if (!productId) {
        return null
    }
    return productId.id
}


exports.createStock = async (stockData) => {
    const { product, transactionType, quantity } = stockData
    const costPerUnit = stockData.costPerUnit

    //valid input
    if (!product) {
        return { success: false, status: 400, message: 'Missing product name to stock' }
    }
    if (!transactionType) {
        return { seuccess: false, status: 400, message: 'Missing transactionType data' }
    }
    if (!quantity) {
        return { seuccess: false, status: 400, message: 'Missing quantity data' }
    }

    const productId = await findProductId(product)
    if (productId === null) {
        return { success: false, status: 400, message: 'product doesnt exsist' }
    }

    const result = await prisma.$transaction(async (prisma) => {
        //create stock
        const newStock = await prisma.stockTransactions.create({
            data: {
                productId: productId,
                transactionType,
                quantity,
                costPerUnit: costPerUnit ? costPerUnit : null
            }
        })

        //update current stock
        let newQuantity;
        if (transactionType === 'restock') {
            newQuantity = {
                increment: quantity
            }
        } else {
            newQuantity = {
                decrement: quantity
            }
        }
        const updateQuantity = await prisma.products.update({
            where: {
                id: productId
            },
            data: {
                quantity: newQuantity
            }
        })

    })
    return { success: true, product }

}