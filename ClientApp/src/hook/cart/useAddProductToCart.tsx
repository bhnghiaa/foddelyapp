import { useDispatch, useSelector } from 'react-redux';
import { addProductToCart } from '../../redux/cartSlice';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { RootState } from '../../redux/store';
import { API } from '../../constants/api';
import { Additive } from '../../@types';
const useAddToCart = () => {
    const dispatch = useDispatch();
    const { userId, token } = useSelector((state: RootState) => state.user);
    const addToCart = useCallback(
        async (productId: string, quantity: number, totalPrice: number, additives: Additive[], note: string) => {
            try {
                // Gửi yêu cầu tới API để thêm sản phẩm vào giỏ hàng
                const response = await axios.post(`${API}/api/cart`, {
                    userId,
                    productId,
                    quantity,
                    totalPrice,
                    additives,
                    note
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });


                // Nếu yêu cầu thành công, cập nhật giỏ hàng trong Redux
                if (response.status === 200) {

                    // Cập nhật giỏ hàng trong Redux
                    dispatch(addProductToCart({
                        id: response.data._id,
                        userId,
                        productId,
                        quantity,
                        totalPrice,
                        additives,
                        note
                    }));
                }
            } catch (error) {
            }
        },
        [ dispatch ]
    );

    return { addToCart };
};

export default useAddToCart;