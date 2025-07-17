const prisma = require('../config/prisma');

exports.createNewCategory = async (categoryData) => {
    const { name } = categoryData;

    // check unique category
    const existingCategory = await prisma.categories.findUnique({
        where : {
            name
        }
    })

    if (existingCategory) {
        return { success: false, status: 400, message: 'Category already exists.'}
    }

    const newCategory = await prisma.categories.create({
        data : {
            name
        }
    })

    return { success: true, status: 200 , name: newCategory.name};
}