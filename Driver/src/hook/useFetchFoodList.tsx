import axios from "axios";
import { useEffect, useState } from "react";
import { FoodItems } from "../@types";
import { API } from "../constants/api";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
const useFetchFoodList = (category: string) => {
    const [ foodList, setFoodList ] = useState<FoodItems[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { token } = useSelector((state: RootState) => state.user);
    const { resId } = useSelector((state: RootState) => state.res);
    const fetchDataFoodList = async () => {
        setLoading(true);
        try {
            const response = await axios.get<FoodItems[]>(`${API}/api/food/${resId}/${category}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setFoodList(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFoodList();
    }, []);

    const refetch = () => {
        fetchDataFoodList();
    };

    return { foodList, loading, error, refetch };
}

export default useFetchFoodList;