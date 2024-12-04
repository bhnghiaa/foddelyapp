import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';

interface Location {
    driverId: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
}

interface UseDriverLocationsResult {
    driverLocation: Location[];
    loading: boolean;
    error: string | null;
    fetchLocations: (driverId: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useDriverLocations = (): UseDriverLocationsResult => {
    const [ driverLocation, setDriverLocation ] = useState<Location[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ currentDriverId, setCurrentDriverId ] = useState<string | null>(null);

    const fetchLocations = async (driverId: string) => {
        try {
            setLoading(true);
            setError(null);
            setCurrentDriverId(driverId);

            const response = await axios.get(`${API}/api/location/${driverId}`);

            if (response.data?.locations) {
                setDriverLocation(response.data.locations);
            }
        } catch (err) {
            setError('Lỗi khi lấy vị trí');
            console.error('Error fetching driver locations:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        if (currentDriverId) {
            await fetchLocations(currentDriverId);
        }
    };
    useEffect(() => {
        refetch();
    }, []);
    return {
        driverLocation,
        loading,
        error,
        fetchLocations,
        refetch
    };
};