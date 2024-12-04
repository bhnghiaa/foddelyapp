import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useCartCount = () => {
    const [ count, setCount ] = useState(0);
    const [ error, setError ] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const response = await axios.get(`/api/cart/count`, { headers: { Authorization: `Bearer ${token}` } });
                setCount(response.data.count);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            }
        };

        fetchCartCount();
    }, [ token ]);

    return { count, error };
};
