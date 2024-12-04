// hooks/useFetchCategories.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../constants/api';

interface Category {
    _id: string;
    title: string;
    imageUrl: string;
}

const useFetchCategories = () => {
    const [ categories, setCategories ] = useState<Category[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    // Hàm để lấy danh sách danh mục
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API}/api/categories`);
            setCategories(response.data);
            setLoading(false);
        } catch (err: Error | any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Sử dụng useEffect để gọi fetchCategories khi component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Hàm để làm mới danh sách danh mục
    const refreshCategories = () => {
        fetchCategories();
    };

    return { categories, loading, error, refreshCategories };
};

export default useFetchCategories;