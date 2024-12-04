import axios from 'axios';
import { useEffect, useState } from "react";
import { Category } from '../@types';
import { API } from '../constants/api';

const useFetchCategories = () => {
    const [ categories, setCategories ] = useState<Category[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDataCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Category[]>(`${API}/api/categories`);
            setLoading(false);
            setCategories(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataCategory();
    }, []);

    const refetch = () => {
        setLoading(true);
        fetchDataCategory();
    };

    return { categories, loading, error, refetch };
};

export default useFetchCategories;
