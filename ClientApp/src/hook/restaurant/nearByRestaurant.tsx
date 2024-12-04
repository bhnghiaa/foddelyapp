import axios from "axios";
import { useEffect, useState } from "react";
import { RestaurantType } from "../../@types";
import { API } from "../../constants/api";
const useFetchNearByRestaurant = (code: string) => {
    const [ restaurants, setRestaurants ] = useState<RestaurantType[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDataRestaurant = async () => {
        setLoading(true);
        try {
            const response = await axios.get<RestaurantType[]>(`${API}/api/restaurants/all/${code}`);
            setRestaurants(response.data);

            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataRestaurant();
    }, []);

    const refetch = () => {
        fetchDataRestaurant();
    };

    return { restaurants, loading, error, refetch };
}

export default useFetchNearByRestaurant;