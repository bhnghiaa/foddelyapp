import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Order } from '../../@types';
const useFetchOrders = (paymentStatus: string, orderStatus: string) => {
    const [ orders, setOrders ] = useState<Order[]>();
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { token } = useSelector((state: RootState) => state.user);
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {

            const response = await axios.get(`${API}/api/orders`, {
                params: {
                    paymentStatus,
                    orderStatus,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOrders(response.data.orders);

        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [ paymentStatus, orderStatus ]);

    useEffect(() => {
        fetchOrders();
    }, [ fetchOrders ]);

    const refetch = () => {
        fetchOrders();
    };

    return { orders, loading, error, refetch };
};

export default useFetchOrders;