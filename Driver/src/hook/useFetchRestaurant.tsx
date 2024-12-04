import { useEffect, useState } from "react";
import { RestaurantType } from "../@types";
import axios from "axios";
import { API } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
const useFetchRestaurant = (_id?: string) => {
    const [ restaurant, setRestaurant ] = useState<RestaurantType>();
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { userId, token } = useSelector((state: RootState) => state.user);
    const fetchDataRestaurant = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${API}/api/restaurants/byId/${userId}`;
            const response = await axios.get(url);
            setRestaurant(response.data);
        } catch (err: Error | any) {
            setError(err);
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

    return { restaurant, loading, error, refetch };
}

export default useFetchRestaurant;