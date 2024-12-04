import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Order } from '../@types';
const useFetchOrders = () => {
    const [ orders, setOrders ] = useState<Order[]>();
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { token } = useSelector((state: RootState) => state.user);
    const [ orderByAdmin, setOrderByAdmin ] = useState<Order[]>();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API}/api/orders/all`, {

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
    }, []);

    const fetchOrderByAdmin = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API}/api/orders/all-admin`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOrderByAdmin(response.data.orders);
        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [ token ]);

    useEffect(() => {
        fetchOrders();
        fetchOrderByAdmin();
    }, [ fetchOrders, fetchOrderByAdmin ]);

    const refetch = () => {
        fetchOrders();
        fetchOrderByAdmin();
    };

    return { orders, loading, error, refetch, fetchOrderByAdmin, orderByAdmin };
};

export default useFetchOrders;