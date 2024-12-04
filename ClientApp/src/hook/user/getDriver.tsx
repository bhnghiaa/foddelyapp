// Add to imports

import { useEffect, useState } from "react";
import { User } from "../../@types";
import axios from "axios";
import { API } from "../../constants/api";


interface UseDriverResult {
    driver: User | null;
    loading: boolean;
    error: string | null;
    getDriver: (driverId: string) => Promise<User | null>;
}

export const useDriver = (): UseDriverResult => {
    const [ driver, setDriver ] = useState<User | null>(null);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const getDriver = async (driverId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get<User>(`${API}/api/user/get-driver/${driverId}`);
            setDriver(response.data);
            return null;

        } catch (err) {
            setError('Error fetching driver');
            console.error('Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        useDriver();
    }
    useEffect(() => {
        refetch();
    }, []);
    return {
        driver,
        loading,
        error,
        getDriver
    };
};