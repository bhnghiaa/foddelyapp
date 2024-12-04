import { useState } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { Order } from '../../@types';

const useUpdateOrder = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const { resId } = useSelector((state: RootState) => state.res);
    const [ orders, setOrders ] = useState<Order[]>();

    const updateOrderStatus = async (orderId: string, orderStatus: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.patch(
                `${API}/api/orders/${orderId}`,
                { orderStatus },
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

    const getOrders = async (orderStatus: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API}/api/orders/all/${resId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    }

    return { updateOrderStatus, loading, error };
};

export default useUpdateOrder;