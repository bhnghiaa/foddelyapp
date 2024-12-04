const Category = require('../models/Categories');

module.exports = {
    createCategory: async (req, res) => {
        const { title, value, imageUrl } = req.body;
        const newCategory = new Category({
            title,
            value,
            imageUrl
        });
        try {
            const savedCategory = await newCategory.save();
            return res.status(200).json(savedCategory);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    updateCategory: async (req, res) => {
        const id = req.params.id;
        const { title, value, imageUrl } = req.body;
        try {
            const updatedCategory = await Category.findByIdAndUpdate(id, { title, value, imageUrl }, { new: true });
            return res.status(200).json(updatedCategory);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    deleteCategory: async (req, res) => {
        const id = req.params.id;
        try {
            await Category.findByIdAndDelete(id);
            return res.status(200).json("Category deleted successfully");
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find({ title: { $ne: "More" } }, { __v: 0 });
            return res.status(200).json(categories);
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    patchCategoryImage: async (req, res) => {
        const id = req.params.id;
        const { imageUrl } = req.body;
        try {
            const existingCategory = await Category.findById(id);
            const updatedCategory = new Category({
                title: existingCategory.title,
                value: existingCategory.value,
                imageUrl: imageUrl
            })
            await updatedCategory.save();
            return res.status(200).json("Category image updated successfully", updatedCategory);
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getRandomCategories: async (req, res) => {
        try {
            const randomCategory = await Category.aggregate([ { $match: { value: { $ne: 'more' } } }, { $sample: { size: 5 } } ]);
            const moreCategory = await Category.findOne({ value: 'more' });

            if (moreCategory) {
                randomCategory.push(moreCategory);
            }
            return res.status(200).json(randomCategory);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

