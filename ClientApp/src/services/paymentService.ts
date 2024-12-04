import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useFetchUser from '../hook/user/useFetchUser';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { API } from '../constants/api';
const getPaymentHistory = () => {
    const {userId} = useSelector((state: RootState) => state.user);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [payment, setPayment] = useState([]);
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API}/api/transactions?customerId=${userId}`);
            setPayment(response.data);
        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [ payment ]);

    useEffect(() => {
        fetchPayments();
    }, [ fetchPayments ]);

    const refetch = () => {
        fetchPayments();
    };

    return { payment, loading, error, refetch };
};

export default getPaymentHistory;