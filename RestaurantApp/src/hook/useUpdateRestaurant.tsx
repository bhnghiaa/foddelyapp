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
}

interface UseRestaurantReturn {
    addRestaurant: (data: RestaurantData) => Promise<any>;
    updateRestaurant: (id: string, data: Partial<RestaurantData>) => Promise<any>;
    updateRestaurantAvailability: (availability: boolean) => Promise<any>;
    loading: boolean;
    error: string | null;
    success: boolean;
}

const useRestaurant = (): UseRestaurantReturn => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ success, setSuccess ] = useState(false);
    const { token } = useSelector((state: RootState) => state.user);
    const { resId } = useSelector((state: RootState) => state.res);

    const validateData = (data: Partial<RestaurantData>) => {
        const requiredFields = [ 'title', 'time', 'imageUrl', 'owner', 'code', 'logoUrl', 'coords' ];
        const missingFields = requiredFields.filter(field => !data[ field as keyof RestaurantData ]);

        if (data.coords) {
            const coordFields = [ 'latitude', 'longitude', 'address', 'title' ];
            const missingCoordFields = coordFields.filter(field => !data.coords?.[ field as keyof typeof data.coords ]);
            if (missingCoordFields.length > 0) {
                return `Missing coordinates fields: ${missingCoordFields.join(', ')}`;
            }
        }

        return missingFields.length > 0 ? `Missing fields: ${missingFields.join(', ')}` : null;
    };

    const addRestaurant = async (data: RestaurantData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const validationError = validateData(data);
            if (validationError) {
                throw new Error(validationError);
            }

            const response = await axios.post(`${API}/api/restaurants`, data);
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add restaurant';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

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

    const updateRestaurantAvailability = async (availability: boolean) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await axios.patch(`${API}/api/restaurants/availability/${resId}`, {
                isAvailable: availability
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update restaurant availability';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        addRestaurant,
        updateRestaurant,
        updateRestaurantAvailability,
        loading,
        error,
        success,
    };
};

export default useRestaurant;