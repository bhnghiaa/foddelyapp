import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../../@types";
import { API } from "../../constants/api";

const useFetchFoodsByRestaurant = (code?: string) => {
    const [ fbr, setFbr ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDatafoodsRestaurant = async () => {
        setLoading(true);
        if (!code) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get<FoodItems[]>(`${API}/api/food/restaurant-foods/${code}`);
            setFbr(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatafoodsRestaurant();
    }, []);

    const refetch = () => {
        fetchDatafoodsRestaurant();
    };

    return { fbr, loading, error, refetch };
}

export default useFetchFoodsByRestaurant;