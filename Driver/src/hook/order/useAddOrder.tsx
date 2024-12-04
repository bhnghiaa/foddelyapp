import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { RootState } from '../../redux/store';
import { addOrder } from '../../redux/orderSlice';
import { Order } from '../../@types';
import { API } from '../../constants/api';
const useAddOrder = () => {
    const dispatch = useDispatch();
    const { userId, token } = useSelector((state: RootState) => state.user);
    const addToOrder = useCallback(
        async (orderData: Order) => {
            try {
                // Gửi yêu cầu tới API để thêm sản phẩm vào giỏ hàng
                const response = await axios.post(`${API}/api/orders`,
                    orderData
                    , {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });


                // Nếu yêu cầu thành công, cập nhật giỏ hàng trong Redux
                if (response.status === 200) {

                    // Cập nhật giỏ hàng trong Redux
                    dispatch(addOrder(orderData))
                }
            } catch (error) {
            }
        },
        [ dispatch ]
    );

    return { addToOrder };
};

export default useAddOrder;