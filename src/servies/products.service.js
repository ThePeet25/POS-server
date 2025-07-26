const prisma = require('../config/prisma');

//find category id from name
const findCategoryId = async (category) => {

    const categoryId = await prisma.categories.findFirst({
        where: {
            name: category
        },
        select: {
            id: true
        }
    })

    if (!categoryId) {
        return null
    }

    return categoryId.id
}

exports.createNewProduct = async (productData) => {
    const { name, author, price, barcode, quantity, category } = productData;

    // check unique product
    const existingProducts = await prisma.products.findFirst({
        where: {
            OR: [
                { name },
                { barcode }
            ]
        }
    })

    if (existingProducts) {
        return { success: false, status: 400, message: 'Product already exists(name or barcode).' }
    }

    const categoryId = await findCategoryId(category)
    if (categoryId === null) {
        return { success: false, status: 400, message: "Category doesn't exists." }
    }

    const newProduct = await prisma.products.create({
        data: {
            name,
            author,
            price,
            barcode,
            quantity,
            categoryId
        }
    })

    return { success: true, status: 200, name: newProduct.name };
}

exports.getProducts = async (
    page, limit, category = null, sortBy = 'name', sortOrder = 'asc'
) => {
    const offset = (page - 1) * limit;
    const whereClause = {};


    //check have category id
    if (category !== null) {
        const categoryId = await findCategoryId(category)
        if (categoryId === null) {
            return { success: false, status: 400, message: "Category doesn't exists." }
        } else {
            whereClause.categoryId = categoryId;
        }

    }

    // Build the ORDER BY clause
    const orderByClause = {};
    orderByClause[sortBy] = sortOrder;

    try {
        //find total product
        const totalProducts = await prisma.products.count({
            where: whereClause
        });

        //get products
        const productSet = await prisma.products.findMany({
            skip: offset,
            take: limit,
            where: whereClause,
            orderBy: orderByClause,
            select: { // Select only the necessary fields for listing
                id: true,
                name: true,
                author: true,
                price: true,
                barcode: true,
                quantity: true,
                // categoryId: true,
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const totalPages = Math.ceil(totalProducts / limit);

        const products = productSet.map(data => ({
            id: data.id,
            name: data.name,
            author: data.author,
            price: data.price,
            barcode: data.barcode,
            quantity: data.quantity,
            category: data.category.name
        }))
        return {
            products,
            totalProducts,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
        };
    } catch (err) {
        console.error('Error in productService.getAllProductsPaginated:', err);
        throw err;
    }

}