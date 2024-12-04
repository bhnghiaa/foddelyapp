const Transaction = require('../models/transaction');

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QISZgKuXrVNElsLUp1M1ZxXU9wDhJRpszjwk04X8xyc04trApyI3dUN4nHermjGVqGWJC9frrSkWU6oOOtQdIb900dW7TSiC7');
module.exports = {
    createTransaction: async (req, res) => {
        const { amount, userId, restaurantId, status } = req.body;
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'vnd',
            });
            const transaction = new Transaction({
                paymentIntentId: paymentIntent.id,
                status: status,
                amount: paymentIntent.amount,
                customerId: userId,
                restaurantId: restaurantId
            });
            await transaction.save();
            res.json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    },

    getTransactions: async (req, res) => {
        const { customerId, restaurantId } = req.query;

        const filter = {};
        if (customerId) filter.customerId = customerId;
        if (restaurantId) filter.restaurantId = restaurantId;

        try {
            const transactions = await Transaction.find(filter);
            return res.json(transactions);
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

