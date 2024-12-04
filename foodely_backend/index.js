const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const userRoute = require('./routes/user');
const restaurantRoute = require('./routes/restaurant');
const categoryRoute = require('./routes/category');
const foodRoute = require('./routes/food');
const cartRoute = require('./routes/cart');
const addressRoute = require('./routes/address');
const orderRoute = require('./routes/order');
const driverRoute = require('./routes/driver');
const ratingRoute = require('./routes/rating');
const sendMail = require('./utils/smtp_function');
const generateOtp = require('./utils/otp_generator');
const authRoute = require('./routes/auth');
const locationRoute = require('./routes/location');
const transactionRoute = require('./routes/transaction');

const cors = require('cors');

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QISZgKuXrVNElsLUp1M1ZxXU9wDhJRpszjwk04X8xyc04trApyI3dUN4nHermjGVqGWJC9frrSkWU6oOOtQdIb900dW7TSiC7');

dotenv.config();


const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://foodely-eeede-default-rtdb.firebaseio.com'
});

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('port', process.env.PORT || 6000)

// Connect to DB
mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Use routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/restaurants', restaurantRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/food', foodRoute);
app.use('/api/cart', cartRoute);
app.use('/api/address', addressRoute);
app.use('/api/orders', orderRoute);
app.use('/api/drivers', driverRoute);
app.use('/api/rating', ratingRoute);
app.use('/api/location', locationRoute);
app.use('/api/transactions', transactionRoute);

const restaurantTokens = []; // Lưu token của app Restaurant

// Endpoint nhận token từ Restaurant
app.post('/register-restaurant-token', (req, res) => {
    const { token } = req.body;
    if (!restaurantTokens.includes(token)) {
        restaurantTokens.push(token);
    }
    console.log('Restaurant Token:', token);
    res.status(200).send('Token saved!');
});

// Endpoint nhận token từ Client và gửi thông báo
app.post('/send-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send('Token không hợp lệ!');
    }

    try {
        console.log('Gửi thông báo tới token:', token);

        const message = {
            notification: {
                title: 'Đơn hàng mới',
                body: 'Một đơn hàng mới từ khách hàng!',
            },
            token: token // Send to single token
        };

        const response = await admin.messaging().send(message);
        console.log('Thông báo gửi thành công:', response);

        res.status(200).send('Thông báo đã được gửi!');
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
        res.status(500).send('Lỗi gửi thông báo!');
    }
});

app.post('/send-notification', async (req, res) => {
    const { token, title, body, orderId, status } = req.body;

    if (!token) {
        return res.status(400).send('Token không hợp lệ!');
    }

    try {
        const message = {
            notification: {
                title: title || 'Cập nhật đơn hàng',
                body: body || `Trạng thái đơn hàng: ${status}`,
            },
            data: {
                orderId: orderId || '',
                status: status || '',
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                type: 'order_update'
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log('Thông báo đã gửi:', response);
        res.status(200).send('Thông báo đã gửi thành công!');

    } catch (error) {
        console.error('Lỗi gửi thông báo:', error);
        res.status(500).send('Lỗi gửi thông báo!');
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});