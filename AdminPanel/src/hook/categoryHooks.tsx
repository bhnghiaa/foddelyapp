// hooks/categoryHooks.ts
import { useState } from 'react';
import axios from 'axios';
import { API } from '../constants/api';

interface Category {
    _id: string;
    title: string;
    value: string;
    imageUrl: string;
}

const api = axios.create({
    baseURL: `${API}/api`,
});

// Hook to create a new category
export const useCreateCategory = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const createCategory = async (title: string, value: string, imageUrl: string): Promise<Category | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/categories', { title, value, imageUrl });
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Lỗi khi tạo danh mục.');
            return null;
        }
    };

    return { createCategory, loading, error };
};

export const useUpdateCategory = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const updateCategory = async (id: string, title: string, value: string, imageUrl: string): Promise<Category | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/categories/${id}`, { title, value, imageUrl });
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Lỗi khi cập nhật danh mục.');
            return null;
        }
    };

    return { updateCategory, loading, error };
};

export const useDeleteCategory = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const deleteCategory = async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/categories/${id}`);
            setLoading(false);
            return true;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Lỗi khi xóa danh mục.');
            return false;
        }
    };

    return { deleteCategory, loading, error };
};