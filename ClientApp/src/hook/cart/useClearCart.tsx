import { useState, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useClearCart = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ count, setCount ] = useState<number | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const clearCartItem = useCallback(async (cartItemId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${API}/api/cart/${cartItemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCount(response.data.count);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'An error occurred');
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return { clearCartItem, loading, error, count };
};

export default useClearCart;