import { useCallback, useState, useEffect } from "react";
import { FoodItems } from "../@types";
import axios from "axios";
import { API } from "../constants/api";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
const useFetchFoods = () => {
    const [ foods, setFoods ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${API}/api/food`
            console.log('url', url);

            const response = await axios.get<FoodItems[]>(url);
            setFoods(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [ fetchData ]);

    const refetch = useCallback(() => {
        fetchData();
    }, [ fetchData ]);

    return { foods, loading, error, refetch };
};

export default useFetchFoods;