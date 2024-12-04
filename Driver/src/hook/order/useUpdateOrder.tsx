import { useState } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

const useUpdateOrder = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const { userId } = useSelector((state: RootState) => state.user);
    const updateOrderStatus = async (orderId: string, orderStatus: string) => {
        setLoading(true);
        setError(null);
        console.log(orderId, orderStatus, userId);
        console.log(userId)
        try {
            const response = await axios.patch(
                `${API}/api/orders/${orderId}`,
                {
                    orderStatus: orderStatus
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    };
    const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(
                `${API}/api/orders/paymentStatus/${orderId}`,
                {
                    paymentStatus: paymentStatus
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    }
    return { updateOrderStatus, loading, error, updatePaymentStatus };
};

export default useUpdateOrder;