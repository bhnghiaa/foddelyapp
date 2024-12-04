import axios from 'axios';
import { useEffect, useState } from 'react';
import { User } from '../../@types'; // Import kiểu dữ liệu người dùng
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { API } from '../../constants/api';

const useFetchUser = () => {
    const [ user, setUser ] = useState<User | null>(null); // Trạng thái lưu trữ thông tin người dùng
    const [ loading, setLoading ] = useState<boolean>(true); // Trạng thái loading
    const [ error, setError ] = useState<Error | null>(null); // Trạng thái lỗi
    const { token, username } = useSelector((state: RootState) => state.user); // Lấy token từ Redux Store

    const fetchDataUser = async () => {
        setLoading(true); // Bắt đầu quá trình loading
        setError(null); // Đặt lại lỗi về null trước khi gọi API

        try {
            const response = await axios.get<User>(`${API}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Sử dụng token từ Redux Store
                },
            });

            setUser(response.data); // Cập nhật trạng thái người dùng

        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred')); // Xử lý lỗi
        } finally {
            setLoading(false); // Kết thúc quá trình loading
        }
    };


    useEffect(() => {
        if (token) {
            fetchDataUser(); // Gọi hàm fetchDataUser khi token có
        } else {
        }
    }, [ token ]); // Gọi lại khi token thay đổi

    return { user, loading, error, refetch: fetchDataUser }; // Trả về thông tin người dùng, trạng thái loading và lỗi
};

export default useFetchUser;
