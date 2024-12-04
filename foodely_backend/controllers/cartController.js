const Cart = require('../models/Cart');

module.exports = {
    addProductToCart: async (req, res) => {
        const userId = req.user.id;
        const { productId, quantity, totalPrice, additives, note } = req.body;
        let count;
        try {
            count = await Cart.countDocuments({ userId: userId });
            const newCartItem = new Cart({
                userId,
                productId,
                totalPrice,
                quantity,
                additives,
                note
            });
            await newCartItem.save();
            count = await Cart.countDocuments({ userId: userId });
            // return res.status(200).json({ message: 'Product added to cart successfully', count });
            return res.status(200).json(newCartItem);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    getCart: async (req, res) => {
        const userId = req.user.id;

        try {
            const cartItems = await Cart.find({ userId }).populate({
                path: 'productId',
                select: 'imageUrl title price rating ratingCount isAvailable',
                populate: { path: 'restaurant', select: 'title rating ratingCount coords' }
            });

            const availableCartItems = cartItems.filter(cartItem => cartItem.productId.isAvailable);

            return res.status(200).json(availableCartItems);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    getCartCount: async (req, res) => {
        const userId = req.user.id;

        try {
            const count = await Cart.countDocuments({ userId });
            return res.status(200).json({ count });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    decrementProductQuantity: async (req, res) => {
        const userId = req.user.id;
        const id = req.params.id;

        try {
            const cartItem = await Cart.findById(id);

            if (cartItem) {
                const productPrice = cartItem.totalPrice / cartItem.quantity;

                if (cartItem.quantity > 1) {
                    cartItem.quantity -= 1;
                    cartItem.totalPrice -= productPrice;
                    await cartItem.save();
                    return res.status(200).json({ message: 'Product quantity decremented successfully' });
                } else {
                    await Cart.findByIdAndDelete({ _id: id });

                    return res.status(200).json({ message: 'Product removed from cart', count });
                }
            } else {
                return res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    incrementProductQuantity: async (req, res) => {
        const userId = req.user.id;
        const id = req.params.id;

        try {
            const cartItem = await Cart.findById(id);

            if (cartItem) {
                const productPrice = cartItem.totalPrice / cartItem.quantity;

                cartItem.quantity += 1;
                cartItem.totalPrice += productPrice;
                await cartItem.save();
                return res.status(200).json({ message: 'Product quantity incremented successfully' });
            } else {
                return res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    removeCartItem: async (req, res) => {
        const cartItemId = req.params.id;
        const userId = req.user.id;

        try {
            await Cart.findByIdAndDelete({ _id: cartItemId });
            const count = await Cart.countDocuments({ userId });

            return res.status(200).json({ message: 'Item removed from cart', count });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
}