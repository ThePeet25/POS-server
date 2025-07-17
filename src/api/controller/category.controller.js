categoryService = require('../../servies/category.service');

exports.createCategory = async (req, res) => {
    const categoryData = req.body;

    //valid data
    if(!categoryData || categoryData.length === 0){
        return res.status(400).json({ meassage: 'missing category data'})
    }

    try {
        const result = await categoryService.createNewCategory(categoryData);

        if(!result.success) {
            return res.status(result.status).json({ message: result.message})
        }

        res.status(201).json({
            message: 'Create category successful!!!',
            category: result.name
        })
    } catch(err) {
        console.log('ERROR', err)

        res.status(500).json({
            message: 'Failed to create category',
            error: err
        })
    }
}