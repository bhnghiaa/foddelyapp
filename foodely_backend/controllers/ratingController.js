const Rating = require('../models/Rating');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

module.exports = {
    addRating: async (req, res) => {
        try {
            const userId = req.user.id;
            const itemType = req.params.itemType;
            const itemId = req.params.itemId;
            const { rating, review, photos } = req.body;
            console.log(userId);
            const newReview = new Rating({
                userId: userId,
                itemType: itemType,
                itemId: itemId,
                rating,
                review,
                photos
            });

            await newReview.save();
            res.status(201).json(newReview);
        } catch (error) {
            res.status(500).json({ error: 'Error creating review' });
        }
    },

    getRating: async (req, res) => {
        try {
            const { itemType, itemId } = req.params;
            const reviews = await Rating.find({ itemType, itemId }).populate([
                {
                    path: 'userId',
                    select: 'username profile'
                },
                {
                    path: 'itemId',
                    select: 'title'
                }
            ]);
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching reviews' });
        }
    }
}