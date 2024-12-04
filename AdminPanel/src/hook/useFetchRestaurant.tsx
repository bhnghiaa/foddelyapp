import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../constants/api';
import { RestaurantType } from '../@types';

const useFetchRestaurant = () => {
    const [ restaurants, setRestaurants ] = useState<RestaurantType[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API}/api/restaurants`);
            setRestaurants(response.data);
        } catch (err: Error | any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRestaurants();
    }, [ fetchRestaurants ]);

    return { restaurants, loading, error, refetch: fetchRestaurants };
};

export default useFetchRestaurant;