import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Cart } from '../@types'; // Đảm bảo rằng bạn đã định nghĩa kiểu Cart trong tệp này
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Hook để giảm số lượng sản phẩm
export const useDecrementProductQuantity = () => {
    const queryClient = useQueryClient();
    const { token } = useSelector((state: RootState) => state.user);

    return useMutation<Cart, AxiosError, string>({
        mutationFn: async (id: string): Promise<Cart> => {
            const response = await axios.patch<Cart>(`http://172.16.53.28:8080/api/cart/decrement/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        },
        onSuccess: () => {
            // Cập nhật dữ liệu trong cache
            queryClient.invalidateQueries({ queryKey: [ 'cartItems' ] });
        },
        onError: (error) => {
            console.error('Error decrementing product quantity:', error);
        },
    });
};

// Hook để tăng số lượng sản phẩm
export const useIncrementProductQuantity = () => {
    const queryClient = useQueryClient();
    const { token } = useSelector((state: RootState) => state.user);

    return useMutation<Cart, AxiosError, string>({
        mutationFn: async (id: string): Promise<Cart> => { // Thêm kiểu trả về
            const response = await axios.patch<Cart>(`http://172.16.53.28:8080/api/cart/increment/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        },
        onSuccess: () => {
            // Cập nhật dữ liệu trong cache
            queryClient.invalidateQueries({ queryKey: [ 'cartItems' ] });
        },
        onError: (error) => {
            console.error('Error incrementing product quantity:', error);
        },
    });
};

export const useRemoveCartItem = () => {
    const queryClient = useQueryClient();
    const token = useSelector((state: RootState) => state.user.token);

    return useMutation<number, AxiosError, string>({
        mutationFn: async (id: string): Promise<number> => {
            const response = await axios.delete(`http://172.16.53.28:8080/api/cart/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.count;
        },
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: [ 'cartItems' ] });
        },
        onError: (error) => {
            console.error('Error removing item from cart:', error);
        },
    });
};