const prisma = require('../config/prisma');

exports.createNewProduct = async (productData) => {
    const { name, author, price, barcode, quantity, category} = productData;

    // check unique product
    const existingProducts = await prisma.products.findFirst({
        where : {
            OR: [
                { name },
                { barcode}
            ]
        }
    })

    if (existingProducts) {
        return { success: false, status: 400, message: 'Product already exists(name or barcode).'}
    }

    // find categories id from name
    const categoryData = await prisma.categories.findFirst({
        where : {
            name: category
        },
        select: {
            id: true
        }
    })

    if(!categoryData) {
        return { success: false, status: 400, message: "Category doesn't exists."}
    } 
    
    const categoryId = categoryData.id
    const newProduct = await prisma.products.create({
        data : {
            name,
            author,
            price,
            barcode,
            quantity,
            categoryId
        }
    })

    return { success: true, status: 200 , name: newProduct.name};
}