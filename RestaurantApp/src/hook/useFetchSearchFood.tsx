import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../@types";

const useFetchSearchFood = (code?: string) => {
    const [ searchFood, setSearchFood ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDataSearchFood = async () => {
        setLoading(true);
        try {
            const response = await axios.get<FoodItems[]>(`http://172.16.53.28:8080/api/food/search/${code}`);
            setSearchFood(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataSearchFood();
    }, []);

    const refetch = () => {
        fetchDataSearchFood();
    };

    return { searchFood, loading, error, refetch };
}

export default useFetchSearchFood;