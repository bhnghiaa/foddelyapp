import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { Rating } from '../../@types';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useAddReview = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ success, setSuccess ] = useState<boolean | null>(null);
    const { token } = useSelector((state: RootState) => state.user);

    const addReview = useCallback(async (reviewData: Rating) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const reviewDataCopy = {
                ...reviewData,
                userId: reviewData.userId._id,
            };
            const response = await axios.post(`${API}/api/rating/${reviewData.itemType}/${reviewData.itemId._id}`,
                reviewDataCopy,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

            setSuccess(true);
            return response.data;
        } catch (err: Error | any) {
            setError(err.response?.data?.error || 'An error occurred');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    }, [ token ]);


    return { addReview, loading, error, success };
};

export default useAddReview;