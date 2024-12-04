import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Order } from '../../@types';

const useFetchOrders = (orderStatus: string, restaurantId: string) => {
    const [ orders, setOrders ] = useState<Order[]>();
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { resId } = useSelector((state: RootState) => state.res);
    const { userId, token } = useSelector((state: RootState) => state.user);
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!resId) {
                setOrders([]);
                return;
            }
            const response = await axios.get(`${API}/api/orders/byRestaurant`, {
                params: {
                    orderStatus: orderStatus,
                    restaurantId: resId
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
    }, [ orderStatus ]);

    useEffect(() => {
        refetch();
    }, [ fetchOrders ]);

    const refetch = () => {
        fetchOrders();
    };

    return { orders, loading, error, refetch };
};

export default useFetchOrders;