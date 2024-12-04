import axios from 'axios';
import { API } from '../constants/api';

interface NotificationPayload {
    token: string;
    orderId?: string;
    customerName?: string;
    orderDetails?: {
        items: string[];
        total: number;
    };
}

export const sendNotification = async (token: string, status: string) => {
    try {
        const response = await axios.post(`${API}/send-notification`, {
            token: "f40cYA2JQUyKa-zmOAwDZb:APA91bESG-BmgpLhdSRzsRTMwVmjtGLELDMBwyBETG9STNeSI8LEKzYdupZ4iA4w8Y8yYixLsL5PAt4Ng0rIts4LQlItT_BO7fNWkx81ZkqN5StPKYZ93L8", // FCM token của thiết bị nhận thông báo
            title: "Cập nhật đơn hàng",
            body: "Đơn hàng của bạn đã được cập nhật",
            orderId: "ORDER_123",
            status: status
        });

        console.log('Notification sent:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
};