import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../@types";

const useFoodsByCategory = (code?: string) => {
    const [ category, setCategory ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);

    const fetchDataCategory = async () => {
        setLoading(true);
        if (!code) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get<FoodItems[]>(`http://172.16.53.28:8080/api/food/category/${code}`);
            setCategory(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataCategory();
    }, []);

    const refetch = () => {
        fetchDataCategory();
    };

    return { category, loading, error, refetch };
}

export default useFoodsByCategory;