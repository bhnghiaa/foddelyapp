const Food = require('../models/Food');

module.exports = {
    addFood: async (req, res) => {
        const { title, foodTags, category, code, restaurant, description, time, price, additives, imageUrl } = req.body;

        if (!title || !foodTags || !category || !code || !restaurant || !description || !time || !price || !additives || !imageUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        try {
            const newFood = new Food(req.body);

            await newFood.save();
            return res.status(201).json(newFood);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getFoodById: async (req, res) => {
        const foodId = req.params.id;
        try {
            const food = await Food.findById(foodId);
            if (!food) {
                return res.status(404).json({ message: 'Food not found' });
            }
            return res.status(200).json(food);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getRandomFood: async (req, res) => {
        try {
            const foods = await Food.find({ isAvailable: true }).sort({ createdAt: -1 });
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });

        }
    },

    getFoodsByRestaurant: async (req, res) => {
        const id = req.params.id;

        try {
            const foods = await Food.find({ restaurant: id, isAvailable: true }).populate('restaurant', 'title imageUrl logoUrl coords');
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getFoodsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;

        try {
            const foods = await Food.find({ isAvailable: true }).aggregate([
                { $match: { category: category, code: code, isAvailable: true } },
                { $project: { __v: 0 } }
            ]);
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });

        }
    },

    searchFoods: async (req, res) => {
        const search = req.params.search;

        try {
            if (search === 'all') {
                let foods = await Food.find({ isAvailable: true });  // Sử dụng let để có thể gán lại giá trị
                if (foods.length === 0) {
                    return res.status(200).json([]);
                }
                foods = await Food.populate(foods, { path: 'restaurant', select: 'title imageUrl logoUrl coords' });
                return res.status(200).json(foods);
            }
            let results = await Food.aggregate([
                {
                    $search: {
                        index: 'foods',
                        text: {
                            query: search,
                            path: {
                                wildcard: '*'
                            }
                        }
                    }
                }
            ]);
            if (results.length) {
                results = await Food.populate(results, { path: 'restaurant', select: 'title imageUrl logoUrl coords' });
                return res.status(200).json(results);
            } else {
                return res.status(200).json(results);
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },


    getRandomFoodsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;

        try {
            let foods;
            foods = await Food.find({ isAvailable: true }).aggregate([
                { $match: { category: category, code: code, isAvailable: true } },
                { $sample: { size: 3 } }
            ]);
            if (!foods || foods.length === 0) {
                foods = await Food.aggregate([
                    { $match: { code: code, isAvailable: true } },
                    { $sample: { size: 3 } }
                ])
            } else if (!foods || foods.length === 0) {
                foods = await Food.aggregate([
                    { $match: { isAvailable: true } },
                    { $sample: { size: 3 } }
                ])
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });

        }
    },
    getAllFoodsByCode: async (req, res) => {
        const code = req.params.code;

        try {
            const foods = await Food.find({ code: code, isAvailable: true });
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getFoodsBycategory: async (req, res) => {
        const category = req.params.category;

        try {
            if (category === 'all') {
                const foods = await Food.find();
                if (foods.length === 0) {
                    return res.status(200).json([]);
                }
                return res.status(200).json(foods);
            }
            const foods = await Food.find({ category: category, isAvailable: true }).populate('restaurant', 'title imageUrl logoUrl coords');
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getFoodByRestaurantAndCategory: async (req, res) => {
        const { restaurantId, category } = req.params;

        try {
            const foods = await Food.find({ restaurant: restaurantId, category: category });
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    updateFood: async (req, res) => {
        const foodId = req.params.id;
        const { title, foodTags, category, code, restaurant, description, time, price, additives, imageUrl } = req.body;
        try {
            const updatedFood = await Food.findByIdAndUpdate(foodId, req.body, { new: true });
            return res.status(200).json(updatedFood);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    updateAllFoodAvailabilityRestaurant: async (req, res) => {
        const restaurantId = req.params.id;
        const { isAvailable } = req.body;
        try {
            await Food.updateMany({ restaurant: restaurantId }, { isAvailable: isAvailable });
            return res.status(200).json({ message: 'All foods availability updated successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    deleteFood: async (req, res) => {
        const foodId = req.params.id;
        try {
            await Food.findByIdAndDelete({ _id: foodId });
            return res.status(200).json({ message: 'Food deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getAllFoodByAdmin: async (req, res) => {
        try {
            const foods = await Food.find().populate([
                {
                    path: 'restaurant',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'category',
                    select: 'title'
                }
            ]);
            if (foods.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(foods);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
