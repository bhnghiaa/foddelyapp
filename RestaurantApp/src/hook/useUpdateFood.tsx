import { useState } from 'react';
import axios from 'axios';
import { API } from '../constants/api';

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { FoodItems } from '../@types';

const useUpdateFood = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const { resId } = useSelector((state: RootState) => state.res);

    const updateFood = async (foodId: string, foodData: FoodItems) => {
        setLoading(true);
        setError(null);
        console.log('foodId:', foodId);
        console.log('token:', token);
        try {
            const response = await axios.patch(
                `${API}/api/food/${foodId}`,
                foodData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    };

    const deleteFood = async (foodId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${API}/api/food/${foodId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    }

    const updateFoodAvailability = async (resId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(
                `${API}/api/food/availability/${resId}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    }

    const updateFoodAvailabilityByRestaurant = async (availability: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(
                `${API}/api/food/availability/${resId}`,
                { isAvailable: availability },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoading(false);
            return response.data;
        } catch (error: any) {
            setLoading(false);
            setError(error.response?.data?.message || error.message);
        }
    }
    return { updateFood, loading, error, deleteFood, updateFoodAvailability, updateFoodAvailabilityByRestaurant };
};

export default useUpdateFood;