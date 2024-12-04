import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../@types";

const useFetchRecommendFood = (code?: string) => {
    const [ foods, setFoods ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDataFood = async () => {
        setLoading(true);
        try {
            const response = await axios.get<FoodItems[]>(`http://172.16.53.28:8080/api/food/recommendation/${code}`);
            setFoods(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFood();
    }, []);

    const refetch = () => {
        fetchDataFood();
    };

    return { foods, loading, error, refetch };
}

export default useFetchRecommendFood;