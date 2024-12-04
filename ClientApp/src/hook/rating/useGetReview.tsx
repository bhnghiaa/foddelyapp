import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { Rating, RestaurantType } from '../../@types';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useGetReview = (itemType: string, itemId: RestaurantType) => {
    const [ reviews, setReviews ] = useState<Rating[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ averageRating, setAverageRating ] = useState<number | null>(null);
    const { token } = useSelector((state: RootState) => state.user);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API}/api/rating/${itemType}/${itemId._id}`);
            setReviews(response.data);

            // Tính trung bình rating
            const totalRating = response.data.reduce((sum: number, review: Rating) => sum + review.rating, 0);
            const avgRating = totalRating / response.data.length;
            setAverageRating(avgRating);
        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [ itemType, itemId, token ]);

    useEffect(() => {
        fetchReviews();
    }, [ fetchReviews ]);

    return { reviews, loading, error, averageRating, refetch: fetchReviews };
};

export default useGetReview;