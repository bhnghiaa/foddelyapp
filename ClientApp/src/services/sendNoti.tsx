import axios from 'axios';
import { API } from '../constants/api';

export const sendNotification = async (title: string, body: string, targetToken: string) => {
    try {
        const response = await axios.post(`${API}/send-notification`, {
            title,
            body,
            token: targetToken,
        });

        if (response.data.success) {
            console.log("Notification sent successfully!");
        } else {
            console.error("Failed to send notification:", response.data.error);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

// Gửi thông báo ví dụ:
// const title = "Hello from Client";
// const body = "This is a test message to Restaurant app";
// const targetToken = "DEVICE_TOKEN_OF_RESTAURANT_APP";

// sendNotification(title, body, targetToken);
