const { get } = require('mongoose');
const Order = require('../models/Order');

module.exports = {
    placeOrder: async (req, res, next) => {
        const newOrder = new Order({
            ...req.body,
            userId: req.user.id,
        });

        try {
            await newOrder.save();

            const orderId = newOrder._id;
            res.status(201).json({ orderId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getUserOrders: async (req, res, next) => {
        const userId = req.user.id;
        const { paymentStatus, orderStatus } = req.query;

        let query = { userId };

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (orderStatus === orderStatus) {
            query.orderStatus = orderStatus;
        }

        try {
            const orders = await Order.find(query).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'driverId',
                    select: 'username profile email phone address _id'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getRestaurantOrders: async (req, res, next) => {
        const { restaurantId, paymentStatus, orderStatus } = req.query;;

        let query = {};

        if (orderStatus === orderStatus) {
            query.orderStatus = orderStatus;
        }

        if (orderStatus === "All") {
            delete query.orderStatus;
        }

        if (restaurantId) {
            query.restaurantId = restaurantId;
        }
        try {
            const orders = await Order.find(query).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateOrderStatus: async (req, res, next) => {
        const orderId = req.params.id;
        const { orderStatus } = req.body;

        try {
            const order = await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: orderStatus, driverId: req.user.id }, { new: true });

            if (!order) {
                return res.status(404).json([]);
            }

            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateOrderPaymentStatus: async (req, res, next) => {
        const orderId = req.params.id;
        const { paymentStatus } = req.body;

        try {
            const order = await Order.findByIdAndUpdate({ _id: orderId }, { paymentStatus: paymentStatus }, { new: true });

            if (!order) {
                return res.status(404).json([]);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.find({}).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'userId',
                    select: 'username profile email phone address'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllOrdersReady: async (req, res, next) => {
        try {
            const orders = await Order.find({ orderStatus: 'Ready' }).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'userId',
                    select: 'username profile email phone address'
                },
                {
                    path: 'driverId',
                    select: 'username profile email phone address'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getOrderByCustomer: async (req, res, next) => {
        const orderStatus = req.params.orderStatus;
        try {
            const orders = await Order.find({ orderStatus: orderStatus, userId: req.user.id }).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'userId',
                    select: 'username profile email phone address'
                },
                {
                    path: 'driverId',
                    select: 'username profile email phone address'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getOrderByDriver: async (req, res, next) => {
        const orderStatus = req.params.orderStatus;
        try {
            const orders = await Order.find({ orderStatus: orderStatus, driverId: req.user.id }).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'userId',
                    select: 'username profile email phone address'
                },
                {
                    path: 'driverId',
                    select: 'username profile email phone address'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllOrderRestaurant: async (req, res, next) => {
        const restaurantId = req.params.id;
        try {
            const orders = await Order.find({ restaurantId: restaurantId }).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllOrderByAdmin: async (req, res, next) => {
        try {
            const orders = await Order.find({}).populate([
                {
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time price'
                },
                {
                    path: 'restaurantId',
                    select: 'title imageUrl logoUrl coords'
                },
                {
                    path: 'userId',
                    select: 'username profile email phone address'
                },
                {
                    path: 'driverId',
                    select: 'username profile email phone address'
                }
            ]);

            res.status(200).json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}