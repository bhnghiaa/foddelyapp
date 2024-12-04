const nodemailer = require('nodemailer');

async function sendMail(userEmail, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    });

    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container {
                        width: 100%;
                        text-align: center;
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .content {
                        margin: 30px 0;
                        font-size: 20px;
                        color: #333;
                    }
                    .verification-code {
                        font-size: 28px;
                        font-weight: bold;
                        color: #4CAF50;
                        background-color: #e0f7e0;
                        padding: 10px;
                        border-radius: 5px;
                        display: inline-block;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 16px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Xác Thực Foodely
                    </div>
                    <div class="content">
                        <p>Quý khách ${userEmail},</p>
                        <p>Cảm ơn quý khách đã đăng ký với Foodely. Vui lòng sử dụng OTP dưới đây để hoàn tất quá trình xác thực:</p>
                        <p class="verification-code">${message}</p>
                        <p>Nếu quý khách không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                    </div>
                    <div class="footer">
                        &copy; 2024 Foodely. Mọi quyền được bảo lưu.
                    </div>
                </div>
            </body>
            </html>
            `

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: 'Mã OTP để xác thực',
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi');
    } catch (error) {
    }
}

module.exports = sendMail;