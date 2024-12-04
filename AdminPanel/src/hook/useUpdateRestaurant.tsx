// useRestaurant.ts
import { useState } from 'react';
import axios from 'axios';
import { API } from '../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface RestaurantData {
    title: string;
    time: string;
    imageUrl: string;
    owner: string;
    code: string;
    logoUrl: string;
    coords: {
        latitude: number;
        longitude: number;
        address: string;
        title: string;
    };
    isAvailable?: boolean;
    verification: string;
}

interface UseRestaurantReturn {
    updateRestaurant: (id: string, data: Partial<RestaurantData>) => Promise<any>;
    loading: boolean;
    error: string | null;
    success: boolean;
}

const useRestaurant = (): UseRestaurantReturn => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ success, setSuccess ] = useState(false);
    const { token } = useSelector((state: RootState) => state.user);
    console.log('token', token);
    const updateRestaurant = async (id: string, data: Partial<RestaurantData>) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await axios.patch(`${API}/api/restaurants/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update restaurant';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateRestaurant,
        loading,
        error,
        success
    };
};

export default useRestaurant;