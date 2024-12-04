import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Order } from '../../@types';
import useFetchRestaurant from '../useFetchRestaurant';
const useFetchOrders = (orderStatus: string) => {
    const [ orders, setOrders ] = useState<Order[]>();
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { userId, token } = useSelector((state: RootState) => state.user);
    const { restaurant, loading: restaurantLoading, error: restaurantError, refetch: refetchRestaurant } = useFetchRestaurant(userId);
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (orderStatus === 'ready') {
                console.log('ready');
                const response = await axios.get(`${API}/api/orders/all/ready`);
                setOrders(response.data.orders);
            }
            else {
                const response = await axios.get(`${API}/api/orders/${orderStatus}/driver`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setOrders(response.data.orders);
            }
        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [ orderStatus ]);

    useEffect(() => {
        fetchOrders();
    }, [ fetchOrders ]);

    const refetch = () => {
        fetchOrders();
    };

    return { orders, loading, error, refetch };
};

export default useFetchOrders;