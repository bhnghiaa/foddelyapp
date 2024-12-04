import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../../@types";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { API } from "../../constants/api";

const useFetchCart = () => {
    const [ cartItems, setCartItems ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    const { token } = useSelector((state: RootState) => state.user);
    const fetchDataCart = async () => {
        setLoading(true);

        try {
            const response = await axios.get(`${API}/api/cart`
                , {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setCartItems(response.data);
            setLoading(false);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.error);
            } else {
                setError(new Error('Failed to fetch cart items'));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataCart();
    }, []);

    const refetch = () => {
        fetchDataCart();
    };

    return { cartItems, loading, error, refetch };
}

export default useFetchCart;