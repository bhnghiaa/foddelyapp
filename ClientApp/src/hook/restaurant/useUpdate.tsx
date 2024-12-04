import { useState } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';

const useUpdateRating = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ restaurant, setRestaurant ] = useState<any>(null);

    const updateRating = async (id: string, avgRating: number, ratingCount: number) => {
        setLoading(true);
        setError(null);
        console.log(ratingCount, "count--------");
        console.log(avgRating, "avgRating--------");
        try {
            const response = await axios.patch(`${API}/api/restaurants/rating/${id}`, { avgRating, ratingCount });
            setRestaurant(response.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { updateRating, loading, error, restaurant };
};

export default useUpdateRating;